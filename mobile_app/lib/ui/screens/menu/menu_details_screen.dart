import 'package:flutter/material.dart';
import 'package:mobile_app/models/menu.dart';
import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/menu_service.dart';
import 'package:mobile_app/services/order_service.dart';

class MenuDetailsScreen extends StatefulWidget {
  const MenuDetailsScreen({
    super.key,
    required this.menuId,
    required this.tableNumber,
    this.orderId,
    this.browseOnly = false,
  });

  final String menuId;
  final int tableNumber;
  final String? orderId;
  final bool browseOnly;

  @override
  State<MenuDetailsScreen> createState() => _MenuDetailsScreenState();
}

class _MenuDetailsScreenState extends State<MenuDetailsScreen>
    with SingleTickerProviderStateMixin {
  late final MenuService _menuService;
  late final OrderService _orderService;
  late Future<Menu> _futureMenu;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  int _quantity = 1;
  bool _adding = false;
  String? _error;
  String? _orderId;
  String? _inlineSuccess;
  bool _orderLocked = false;

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
    _orderService = OrderService();
    _futureMenu = _menuService.getMenu(widget.menuId);
    _orderId = widget.orderId;

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.3, 1.0, curve: Curves.easeOut),
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.3, 1.0, curve: Curves.easeOutCubic),
      ),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _incrementQuantity() {
    setState(() {
      _quantity++;
      _error = null;
    });
  }

  void _decrementQuantity() {
    if (_quantity > 1) {
      setState(() {
        _quantity--;
        _error = null;
      });
    }
  }

  Future<void> _handleAddToOrder(Menu menu) async {
    if (_quantity <= 0) {
      setState(() {
        _error = 'Quantity must be at least 1';
        _inlineSuccess = null;
      });
      return;
    }

    setState(() {
      _error = null;
      _adding = true;
      _inlineSuccess = null;
    });

    try {
      // If we already have an order, make sure it's still editable.
      if (_orderId != null) {
        if (_orderLocked) {
          setState(() {
            _error = 'This order is already paid or closed. You cannot add more items.';
            _adding = false;
          });
          return;
        }

        try {
          final order = await _orderService.getOrder(_orderId!);
          final status = (order['status'] ?? '').toString().toLowerCase();
          final isClosed = [
            'paid',
            'served',
            'completed',
            'canceled',
            'cancelled',
          ].contains(status);

          if (isClosed) {
            if (mounted) {
              setState(() {
                _orderLocked = true;
                _error = 'This order is already paid or closed. You cannot add more items.';
                _adding = false;
              });
            }
            return;
          }
        } catch (_) {
          if (mounted) {
            setState(() {
              _error = 'Unable to verify order status. Please try again.';
              _adding = false;
            });
          }
          return;
        }
      }

      if (_orderId == null) {
        final response = await _orderService.createOrder(
          tableNumber: widget.tableNumber,
          items: [
            {
              'menu_id': menu.id,
              'quantity': _quantity,
            },
          ],
        );

        final data = response['data'];
        if (data is Map<String, dynamic> && data['id'] != null) {
          _orderId = data['id'].toString();
        } else {
          throw Exception('Invalid create order response');
        }

        if (mounted) {
          _showSuccessSnackbar('Order created! Item added successfully 🎉');
          setState(() {
            _inlineSuccess = 'Added to order table ${widget.tableNumber}';
          });
          Future.delayed(const Duration(milliseconds: 2500), () {
            if (!mounted) return;
            setState(() {
              // Only clear if nothing else has changed it meanwhile.
              _inlineSuccess = null;
            });
          });
        }

        if (widget.orderId == null && _orderId != null) {
          final subtotal = menu.price * _quantity;
          Navigator.of(context).pop({
            'orderId': _orderId!,
            'itemsCount': _quantity,
            'subtotal': subtotal,
          });
          return;
        }
      } else {
        await _orderService.addItemsToOrder(
          orderId: _orderId!,
          items: [
            {
              'menu_id': menu.id,
              'quantity': _quantity,
            },
          ],
        );

        if (mounted) {
          _showSuccessSnackbar('Item added to your order! ✓');
          setState(() {
            _inlineSuccess = 'Added to order table ${widget.tableNumber}';
          });
          Future.delayed(const Duration(milliseconds: 2500), () {
            if (!mounted) return;
            setState(() {
              _inlineSuccess = null;
            });
          });
        }
      }

      // Reset quantity after successful add
      if (mounted) {
        setState(() {
          _quantity = 1;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _adding = false;
        });
      }
    }
  }

  void _showSuccessSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF34D399),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.3),
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white.withOpacity(0.1),
              width: 1,
            ),
          ),
          child: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.of(context).pop(),
            style: IconButton.styleFrom(
              foregroundColor: Colors.white,
            ),
          ),
        ),
      ),
      body: FutureBuilder<Menu>(
        future: _futureMenu,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      shape: BoxShape.circle,
                    ),
                    child: const CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF34D399)),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Loading details...',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.error_outline_rounded,
                        size: 48,
                        color: Colors.redAccent,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Failed to load details',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${snapshot.error}',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 14,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          final menu = snapshot.data;
          if (menu == null) {
            return const Center(
              child: Text('Menu item not found'),
            );
          }

          return Stack(
            children: [
              SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  children: [
                    // Hero Image Section
                    Hero(
                      tag: 'menu-${widget.menuId}',
                      child: Container(
                        height: 360,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              const Color(0xFF020617),
                              const Color(0xFF34D399).withOpacity(0.1),
                            ],
                          ),
                        ),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            if (menu.picture != null && menu.picture!.isNotEmpty)
                              Image.network(
                                _resolvePictureUrl(menu.picture),
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => _buildPlaceholder(),
                              )
                            else
                              _buildPlaceholder(),
                            // Gradient overlay
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [
                                    Colors.transparent,
                                    const Color(0xFF020617).withOpacity(0.8),
                                    const Color(0xFF020617),
                                  ],
                                  stops: const [0.5, 0.85, 1.0],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // Content Section
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: Transform.translate(
                          offset: const Offset(0, -40),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  menu.name,
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: -1,
                                    height: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF34D399),
                                    borderRadius: BorderRadius.circular(16),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF34D399).withOpacity(0.4),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Text(
                                    '\$${menu.price.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: -0.5,
                                      color: Color(0xFF020617),
                                    ),
                                  ),
                                ),
                                if (menu.description != null &&
                                    menu.description!.isNotEmpty) ...[
                                  const SizedBox(height: 24),
                                  Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                        colors: [
                                          const Color(0xFF1E293B).withOpacity(0.5),
                                          const Color(0xFF0F172A).withOpacity(0.5),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                        color: const Color(0xFF334155).withOpacity(0.5),
                                        width: 1,
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(8),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF34D399)
                                                    .withOpacity(0.2),
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                              child: const Icon(
                                                Icons.description_rounded,
                                                size: 20,
                                                color: Color(0xFF34D399),
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            const Text(
                                              'Description',
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w600,
                                                letterSpacing: -0.3,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 12),
                                        Text(
                                          menu.description!,
                                          style: TextStyle(
                                            fontSize: 15,
                                            height: 1.6,
                                            color: Colors.white.withOpacity(0.8),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 120),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (!widget.browseOnly)
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          const Color(0xFF020617).withOpacity(0.95),
                          const Color(0xFF020617),
                        ],
                        stops: const [0.0, 0.3, 1.0],
                      ),
                    ),
                    padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
                    child: _buildOrderSection(menu),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildOrderSection(Menu menu) {
    final totalPrice = menu.price * _quantity;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1E293B).withOpacity(0.95),
            const Color(0xFF0F172A).withOpacity(0.95),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFF334155).withOpacity(0.5),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_error != null)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.red.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error_outline_rounded,
                    color: Colors.redAccent,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _error!,
                      style: const TextStyle(
                        color: Colors.redAccent,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          const Text(
            'Quantity',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              // Quantity Controls
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF334155).withOpacity(0.5),
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    _buildQuantityButton(
                      icon: Icons.remove_rounded,
                      onPressed: _decrementQuantity,
                      enabled: _quantity > 1,
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        '$_quantity',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    _buildQuantityButton(
                      icon: Icons.add_rounded,
                      onPressed: _incrementQuantity,
                      enabled: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Add to Order Button
              Expanded(
                child: _buildAddButton(menu, totalPrice),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Total: \$${totalPrice.toStringAsFixed(2)}',
            style: TextStyle(
              color: Colors.white.withOpacity(0.85),
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (_inlineSuccess != null) ...[
            const SizedBox(height: 4),
            Text(
              _inlineSuccess!,
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 11,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuantityButton({
    required IconData icon,
    required VoidCallback onPressed,
    required bool enabled,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: enabled ? onPressed : null,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          child: Icon(
            icon,
            color: enabled
                ? const Color(0xFF34D399)
                : Colors.white.withOpacity(0.3),
            size: 24,
          ),
        ),
      ),
    );
  }

  Widget _buildAddButton(Menu menu, double totalPrice) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: _adding ? null : () => _handleAddToOrder(menu),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: _adding
                ? Colors.grey.withOpacity(0.3)
                : const Color(0xFF34D399),
            borderRadius: BorderRadius.circular(16),
            boxShadow: _adding
                ? []
                : [
                    BoxShadow(
                      color: const Color(0xFF34D399).withOpacity(0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
          ),
          child: _adding
              ? const Center(
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                )
              : FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.shopping_bag_rounded,
                        size: 22,
                        color: Color(0xFF020617),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Add • \$${totalPrice.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.3,
                          color: Color(0xFF020617),
                        ),
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF34D399).withOpacity(0.3),
            const Color(0xFF10B981).withOpacity(0.2),
          ],
        ),
      ),
      child: const Center(
        child: Icon(
          Icons.restaurant_rounded,
          size: 80,
          color: Color(0xFF34D399),
        ),
      ),
    );
  }
}