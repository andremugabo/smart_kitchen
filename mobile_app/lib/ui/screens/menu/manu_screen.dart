import 'package:flutter/material.dart';
import 'package:mobile_app/models/menu.dart';
import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/menu_service.dart';
import 'package:mobile_app/services/menu_category_service.dart';
import 'package:mobile_app/services/order_service.dart';
import 'package:mobile_app/ui/screens/menu/menu_details_screen.dart';
import 'package:mobile_app/ui/screens/order/order_details_screen.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key, this.tableNumber, this.orderId});

  /// Optional table number. If null, screen works in browse-only mode.
  final int? tableNumber;

  /// Optional existing order id. If provided, items will be added to this order.
  final String? orderId;

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> with SingleTickerProviderStateMixin {
  late final MenuService _menuService;
  late final MenuCategoryService _menuCategoryService;
  late final OrderService _orderService;
  late Future<List<Menu>> _futureMenus;
  String? _orderId;
  late AnimationController _animationController;
  String _categoryFilter = 'all';
  List<Map<String, dynamic>> _categories = const [];
  bool _loadingCategories = true;
  bool _onlyActive = false;
  int? _orderItemsCount;
  double? _orderSubtotal;
  bool _loadingSummary = false;

  String _formatOrderCode(String id) {
    if (id.isEmpty) return 'ORD-????';
    final core = id.length > 4 ? id.substring(0, 4) : id;
    return 'ORD-${core.toUpperCase()}';
  }

  String _resolvePictureUrl(String? picture) {
    if (picture == null || picture.isEmpty) return '';
    if (picture.startsWith('http')) return picture;
    const rawBase = ApiClient.baseUrl;
    final base = rawBase.endsWith('/api')
        ? rawBase.substring(0, rawBase.length - 4)
        : rawBase;
    final cleaned = picture.replaceFirst(RegExp(r'^/'), '');
    return '$base/$cleaned';
  }

  @override
  void initState() {
    super.initState();
    _menuService = MenuService();
    _menuCategoryService = MenuCategoryService();
    _orderService = OrderService();
    _futureMenus = _menuService.listMenus(page: 1, limit: 100);
    _orderId = widget.orderId;
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    if (_orderId != null) {
      // Preload summary if we arrive with an existing order.
      _loadOrderSummary();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _reload() {
    _animationController.forward(from: 0);
    setState(() {
      _futureMenus = _menuService.listMenus(page: 1, limit: 100);
    });
    _loadCategories();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Load categories once when screen is first built.
    if (_loadingCategories && _categories.isEmpty) {
      _loadCategories();
    }
  }

  Future<void> _loadOrderSummary() async {
    final id = _orderId;
    if (id == null || widget.tableNumber == null) return;

    setState(() {
      _loadingSummary = true;
    });

    try {
      final data = await _orderService.getOrder(id);

      int? itemCount;
      double? subtotal;

      final items = data['items'];
      if (items is List) {
        int totalQty = 0;
        for (final item in items) {
          if (item is Map<String, dynamic>) {
            final q = item['quantity'];
            if (q is num) {
              totalQty += q.toInt();
            } else {
              totalQty += 1;
            }
          } else {
            totalQty += 1;
          }
        }
        itemCount = totalQty;
      }

      final rawTotal = data['total_amount'] ?? data['totalAmount'];
      if (rawTotal is num) {
        subtotal = rawTotal.toDouble();
      }

      if (!mounted) return;
      setState(() {
        _orderItemsCount = itemCount;
        _orderSubtotal = subtotal;
        _loadingSummary = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loadingSummary = false;
      });
    }
  }

  Future<void> _loadCategories() async {
    try {
      final items = await _menuCategoryService.listMenuCategories();
      if (!mounted) return;
      setState(() {
        _categories = items;
        _loadingCategories = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _categories = const [];
        _loadingCategories = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final browseOnly = widget.tableNumber == null;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 48,
        title: Text(
          browseOnly ? 'Menu' : 'Order',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          RotationTransition(
            turns: _animationController,
            child: IconButton(
              icon: const Icon(Icons.refresh_rounded),
              onPressed: _reload,
              style: IconButton.styleFrom(
                backgroundColor: Colors.white.withOpacity(0.1),
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: FutureBuilder<List<Menu>>(
        future: _futureMenus,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF34D399)),
              ),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Text(
                  'Failed to load menu: ${snapshot.error}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final menus = snapshot.data ?? const <Menu>[];

          if (menus.isEmpty) {
            return const Center(
              child: Text(
                'No menu items yet',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                ),
              ),
            );
          }
          final filtered = menus.where((m) {
            if (_categoryFilter != 'all' && m.categoryId != _categoryFilter) {
              return false;
            }
            if (_onlyActive && !m.isActive) {
              return false;
            }
            return true;
          }).toList();

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.08),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              browseOnly ? Icons.restaurant_menu : Icons.table_restaurant,
                              size: 14,
                              color: Colors.white.withOpacity(0.72),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              browseOnly
                                  ? 'Browse full menu'
                                  : (_orderItemsCount != null || _orderSubtotal != null
                                      ? 'Table ${widget.tableNumber} · ${_orderItemsCount ?? '—'} items · ${_orderSubtotal != null ? '\$${_orderSubtotal!.toStringAsFixed(2)}' : '—'}'
                                      : 'Table ${widget.tableNumber} · New order'),
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        if (!browseOnly && _orderId != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            '${_formatOrderCode(_orderId!)} · Table ${widget.tableNumber ?? '-'}',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6),
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildCategoryChip('All', 'all'),
                      if (_categories.isNotEmpty)
                        ..._categories.map(
                          (c) => _buildCategoryChip(
                            (c['name'] ?? '').toString(),
                            (c['id'] ?? '').toString(),
                          ),
                        ),
                      const SizedBox(width: 8),
                      _buildOnlyActiveChip(),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final menu = filtered[index];
                    String? categoryLabel;
                    if (_categories.isNotEmpty) {
                      final match = _categories.firstWhere(
                        (c) => (c['id'] ?? '').toString() == menu.categoryId,
                        orElse: () => const {},
                      );
                      if (match.isNotEmpty) {
                        categoryLabel = (match['name'] ?? '').toString();
                      }
                    }

                    return _MenuCard(
                      menu: menu,
                      browseOnly: browseOnly,
                      resolvePictureUrl: _resolvePictureUrl,
                      categoryLabel: categoryLabel,
                      onTap: () async {
                        final result = await Navigator.of(context).push<dynamic>(
                          MaterialPageRoute(
                            builder: (_) => MenuDetailsScreen(
                              menuId: menu.id,
                              tableNumber: browseOnly ? 0 : widget.tableNumber!,
                              orderId: browseOnly ? null : _orderId,
                              browseOnly: browseOnly,
                            ),
                          ),
                        );

                        if (!browseOnly && result != null) {
                          String? newOrderId;
                          int? itemsCount;
                          double? subtotal;

                          if (result is String && result.isNotEmpty) {
                            newOrderId = result;
                          } else if (result is Map<String, dynamic>) {
                            final value = result['orderId'];
                            if (value is String && value.isNotEmpty) {
                              newOrderId = value;
                            }

                            final rawCount = result['itemsCount'];
                            if (rawCount is int) {
                              itemsCount = rawCount;
                            } else if (rawCount is num) {
                              itemsCount = rawCount.toInt();
                            }

                            final rawSubtotal = result['subtotal'];
                            if (rawSubtotal is num) {
                              subtotal = rawSubtotal.toDouble();
                            }
                          }

                          if (newOrderId != null) {
                            setState(() {
                              _orderId = newOrderId;
                              if (itemsCount != null) {
                                _orderItemsCount = itemsCount;
                              }
                              if (subtotal != null) {
                                _orderSubtotal = subtotal;
                              }
                            });

                            // Still refresh from backend to stay in sync with server totals.
                            _loadOrderSummary();
                          }
                        }
                      },
                    );
                  },
                ),
              ),
              if (!browseOnly && _orderId != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () {
                      if (_orderId == null) return;
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => OrderDetailsScreen(orderId: _orderId!),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF020617),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.08),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Current order',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.85),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 2),
                              if (_loadingSummary)
                                Text(
                                  'Loading summary...',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.65),
                                    fontSize: 11,
                                  ),
                                )
                              else
                                Text(
                                  'Items added: ${_orderItemsCount ?? '—'} · Subtotal: ${_orderSubtotal != null ? '\$${_orderSubtotal!.toStringAsFixed(2)}' : '—'}',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.65),
                                    fontSize: 11,
                                  ),
                                ),
                            ],
                          ),
                          Icon(
                            Icons.receipt_long,
                            size: 18,
                            color: Colors.white.withOpacity(0.7),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCategoryChip(String label, String value) {
    final selected = _categoryFilter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) {
          setState(() {
            _categoryFilter = value;
          });
        },
        labelStyle: TextStyle(
          color: selected ? Colors.black : Colors.white,
          fontSize: 12,
        ),
        selectedColor: const Color(0xFF34D399),
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  Widget _buildOnlyActiveChip() {
    final selected = _onlyActive;
    return ChoiceChip(
      label: const Text('Only Active'),
      selected: selected,
      onSelected: (_) {
        setState(() {
          _onlyActive = !selected;
        });
      },
      labelStyle: TextStyle(
        color: selected ? Colors.black : Colors.white,
        fontSize: 12,
      ),
      selectedColor: const Color(0xFF34D399),
      backgroundColor: const Color(0xFF1E293B),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    );
  }
}

class _MenuCard extends StatefulWidget {
  const _MenuCard({
    required this.menu,
    required this.browseOnly,
    required this.resolvePictureUrl,
    this.categoryLabel,
    this.onTap,
  });

  final Menu menu;
  final bool browseOnly;
  final String Function(String?) resolvePictureUrl;
  final String? categoryLabel;
  final VoidCallback? onTap;

  @override
  State<_MenuCard> createState() => _MenuCardState();
}

class _MenuCardState extends State<_MenuCard> with SingleTickerProviderStateMixin {
  bool _isPressed = false;
  late AnimationController _scaleController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.97).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: GestureDetector(
          onTapDown: widget.onTap != null
              ? (_) {
                  setState(() => _isPressed = true);
                  _scaleController.forward();
                }
              : null,
          onTapUp: widget.onTap != null
              ? (_) {
                  setState(() => _isPressed = false);
                  _scaleController.reverse();
                }
              : null,
          onTapCancel: widget.onTap != null
              ? () {
                  setState(() => _isPressed = false);
                  _scaleController.reverse();
                }
              : null,
          onTap: widget.onTap,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  const Color(0xFF0F172A).withOpacity(0.95),
                  const Color(0xFF020617).withOpacity(0.95),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: _isPressed
                    ? const Color(0xFF34D399).withOpacity(0.6)
                    : Colors.white.withOpacity(0.05),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: _isPressed
                      ? const Color(0xFF34D399).withOpacity(0.35)
                      : Colors.black.withOpacity(0.25),
                  blurRadius: _isPressed ? 20 : 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: SizedBox(
                height: 140,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                  // Image Section
                  Hero(
                    tag: 'menu-${widget.menu.id}',
                    child: SizedBox(
                      width: 120,
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Color(0xFF0F172A),
                        ),
                        child: widget.menu.picture != null
                            ? Image.network(
                                widget.resolvePictureUrl(widget.menu.picture),
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) =>
                                    _buildPlaceholderIcon(),
                                loadingBuilder:
                                    (context, child, loadingProgress) {
                                  if (loadingProgress == null) return child;
                                  return Center(
                                    child: CircularProgressIndicator(
                                      value: loadingProgress
                                                  .expectedTotalBytes !=
                                              null
                                          ? loadingProgress
                                                  .cumulativeBytesLoaded /
                                              loadingProgress
                                                  .expectedTotalBytes!
                                          : null,
                                      strokeWidth: 2,
                                      valueColor:
                                          const AlwaysStoppedAnimation<Color>(
                                        Color(0xFF34D399),
                                      ),
                                    ),
                                  );
                                },
                              )
                            : _buildPlaceholderIcon(),
                      ),
                    ),
                  ),
                  // Content Section
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Text(
                            widget.menu.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              letterSpacing: -0.2,
                              height: 1.2,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              if (widget.categoryLabel != null &&
                                  widget.categoryLabel!.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF34D399)
                                        .withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(999),
                                    border: Border.all(
                                      color: const Color(0xFF34D399)
                                          .withOpacity(0.5),
                                    ),
                                  ),
                                  child: Text(
                                    widget.categoryLabel!,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF34D399),
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                ),
                              if (widget.categoryLabel != null &&
                                  widget.categoryLabel!.isNotEmpty)
                                const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: (widget.menu.isActive
                                          ? const Color(0xFF22C55E)
                                          : Colors.grey)
                                      .withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(999),
                                  border: Border.all(
                                    color: (widget.menu.isActive
                                            ? const Color(0xFF22C55E)
                                            : Colors.grey)
                                        .withOpacity(0.5),
                                  ),
                                ),
                                child: Text(
                                  widget.menu.isActive ? 'Active' : 'Hidden',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: widget.menu.isActive
                                        ? const Color(0xFF22C55E)
                                        : Colors.grey,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (widget.menu.description != null &&
                              widget.menu.description!.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              widget.menu.description!,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.white.withOpacity(0.6),
                                height: 1.3,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFF34D399),
                                      Color(0xFF10B981),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF34D399)
                                          .withOpacity(0.35),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Text(
                                  '\Frw${widget.menu.price.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: -0.2,
                                    color: Color(0xFF020617),
                                  ),
                                ),
                              ),
                              if (!widget.browseOnly)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.08),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.add_circle_outline_rounded,
                                        size: 16,
                                        color: const Color(0xFF34D399),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Add',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.white
                                              .withOpacity(0.8),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      ),
    );
  }

  Widget _buildPlaceholderIcon() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF34D399).withOpacity(0.2),
            const Color(0xFF10B981).withOpacity(0.2),
          ],
        ),
      ),
      child: const Icon(
        Icons.restaurant_rounded,
        size: 40,
        color: Color(0xFF34D399),
      ),
    );
  }
}