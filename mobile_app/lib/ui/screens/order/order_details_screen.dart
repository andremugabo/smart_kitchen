import 'package:flutter/material.dart';
import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/order_service.dart';
import 'package:mobile_app/services/payment_service.dart';
import 'package:mobile_app/ui/screens/payments/payment_details_screen.dart';
import 'package:mobile_app/services/order_change_request_service.dart';
import 'package:mobile_app/ui/screens/menu/manu_screen.dart';

class OrderDetailsScreen extends StatefulWidget {
  const OrderDetailsScreen({super.key, required this.orderId});

  final String orderId;

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  final OrderService _orderService = OrderService();
  late Future<Map<String, dynamic>> _futureOrder;
  final OrderChangeRequestService _orderChangeRequestService = OrderChangeRequestService();
  bool _hasPendingChangeRequest = false;
  List<Map<String, dynamic>> _pendingRequests = [];
  final PaymentService _paymentService = PaymentService();
  bool _creatingPayment = false;

  String _formatOrderCode(String id) {
    if (id.isEmpty) return 'ORD-????';
    final core = id.length > 4 ? id.substring(0, 4) : id;
    return 'ORD-${core.toUpperCase()}';
  }

  Future<void> _showPaymentMethodSheet(String orderId, double amount) async {
    if (_creatingPayment) return;
    String selectedMethod = 'cash';

    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF020617),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Choose payment method',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...[
                    {'label': 'Cash', 'value': 'cash', 'icon': Icons.payments_rounded},
                    {'label': 'Card', 'value': 'card', 'icon': Icons.credit_card_rounded},
                    {'label': 'Mobile', 'value': 'mobile', 'icon': Icons.phone_iphone_rounded},
                    {'label': 'Tab', 'value': 'tab', 'icon': Icons.receipt_long_rounded},
                  ].map((m) {
                    final v = m['value'] as String;
                    return RadioListTile<String>(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      activeColor: const Color(0xFF34D399),
                      value: v,
                      groupValue: selectedMethod,
                      onChanged: (val) {
                        if (val == null) return;
                        setModalState(() {
                          selectedMethod = val;
                        });
                      },
                      title: Row(
                        children: [
                          Icon(
                            m['icon'] as IconData,
                            size: 18,
                            color: Colors.white.withOpacity(0.8),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            m['label'] as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF34D399),
                        foregroundColor: const Color(0xFF020617),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        Navigator.of(context).pop();
                        _createPaymentForOrder(orderId, amount, method: selectedMethod);
                      },
                      child: const Text(
                        'Confirm payment',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _createPaymentForOrder(String orderId, double amount,
      {String method = 'cash'}) async {
    if (_creatingPayment) return;
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot create a payment with zero amount.')),
      );
      return;
    }

    setState(() {
      _creatingPayment = true;
    });

    try {
      final payment = await _paymentService.createPayment(
        orderId: orderId,
        amount: amount,
        method: method,
      );

      final paymentId = payment['id']?.toString();

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment created successfully.')),
      );

      if (paymentId != null && paymentId.isNotEmpty) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => PaymentDetailsScreen(paymentId: paymentId),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create payment: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _creatingPayment = false;
        });
      }
    }
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

  String _buildPendingChangeMessage() {
    if (_pendingRequests.isEmpty) {
      return 'There is a pending change request for this order. Please wait for manager approval.';
    }

    final hasVoidOrder = _pendingRequests.any((r) =>
        (r['type'] ?? '').toString().toLowerCase() == 'void_order');
    final hasRemoveItem = _pendingRequests.any((r) =>
        (r['type'] ?? '').toString().toLowerCase() == 'remove_item');

    if (hasVoidOrder && hasRemoveItem) {
      return 'Pending requests to void this order and remove items. Please wait for manager approval.';
    }
    if (hasVoidOrder) {
      return 'Pending request to void this order. Please wait for manager approval.';
    }
    if (hasRemoveItem) {
      return 'Pending request to remove one or more items from this order. Please wait for manager approval.';
    }

    return 'There is a pending change request for this order. Please wait for manager approval.';
  }

  Future<void> _loadPendingChangeRequests() async {
    try {
      final items = await _orderChangeRequestService.listPendingForOrder(widget.orderId);
      if (!mounted) return;
      setState(() {
        _pendingRequests = items;
        _hasPendingChangeRequest = items.isNotEmpty;
      });
    } catch (_) {
      // Ignore errors here; banner is just informational.
    }
  }

  Future<void> _requestVoidOrder(String orderId) async {
    try {
      await _orderChangeRequestService.createRequest(
        orderId: orderId,
        type: 'void_order',
      );

      if (!mounted) return;
      setState(() {
        _hasPendingChangeRequest = true;
        _pendingRequests = [
          ..._pendingRequests,
          {'type': 'void_order', 'status': 'pending', 'order_id': orderId},
        ];
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Void request sent for this order. Awaiting approval.'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to send void request: $e'),
        ),
      );
    }
  }

  Future<void> _showVoidItemDialog(String orderId, String detailId) async {
    final controller = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text(
            'Request void item',
            style: TextStyle(color: Colors.white),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Reason (optional)',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: controller,
                maxLines: 3,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'e.g. Wrong item, customer changed mind',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.4)),
                  filled: true,
                  fillColor: const Color(0xFF020617),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: Colors.white.withOpacity(0.2),
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: Colors.white.withOpacity(0.2),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: Color(0xFF34D399),
                    ),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Send request'),
            ),
          ],
        );
      },
    );

    if (confirmed != true) return;

    try {
      await _orderChangeRequestService.createRequest(
        orderId: orderId,
        orderDetailId: detailId,
        type: 'remove_item',
        reason: controller.text.trim(),
      );

      if (!mounted) return;
      setState(() {
        _hasPendingChangeRequest = true;
        _pendingRequests = [
          ..._pendingRequests,
          {
            'type': 'remove_item',
            'status': 'pending',
            'order_id': orderId,
            'order_detail_id': detailId,
          },
        ];
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Void request sent for this item. Awaiting approval.'),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to send request: $e'),
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _futureOrder = _orderService.getOrder(widget.orderId);
    _loadPendingChangeRequests();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 48,
        title: const Text(
          'Order details',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _futureOrder,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF34D399)),
              ),
            );
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Text(
                  'Failed to load order: ${snapshot.error}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final order = snapshot.data;
          if (order == null) {
            return const Center(
              child: Text(
                'Order not found',
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          final table = order['table_number']?.toString() ?? '-';
          final status = (order['status'] ?? '').toString();
          final rawTotalValue = order['total_amount'];
          final double totalAmount;
          if (rawTotalValue is num) {
            totalAmount = rawTotalValue.toDouble();
          } else {
            totalAmount = double.tryParse(rawTotalValue?.toString() ?? '0') ?? 0.0;
          }
          final total = totalAmount.toStringAsFixed(2);
          final createdAtRaw = (order['order_date'] ?? '').toString();
          final details = (order['order_details'] ?? order['OrderDetails'] ?? []) as List<dynamic>;

          final orderId = order['id']?.toString() ?? widget.orderId;
          final tableNumber = order['table_number'] is int
              ? order['table_number'] as int
              : int.tryParse(order['table_number']?.toString() ?? '0') ?? 0;

          final userData = order['User'] as Map<String, dynamic>?;
          String? customerName;
          if (userData != null) {
            customerName = (userData['username'] ??
                    userData['name'] ??
                    userData['full_name'] ??
                    userData['email'])
                ?.toString();
          }

          final orderCode = _formatOrderCode(orderId);
          final orderSummaryParts = <String>[orderCode];
          if (customerName != null && customerName.isNotEmpty) {
            orderSummaryParts.add(customerName);
          }
          if (table.isNotEmpty && table != '-') {
            orderSummaryParts.add('Table $table');
          }
          final orderSummaryLabel = orderSummaryParts.join(' · ');

          String createdAtDisplay = createdAtRaw;
          if (createdAtRaw.isNotEmpty) {
            try {
              final dt = DateTime.parse(createdAtRaw).toLocal();
              String two(int v) => v.toString().padLeft(2, '0');
              createdAtDisplay =
                  '${dt.year}-${two(dt.month)}-${two(dt.day)} ${two(dt.hour)}:${two(dt.minute)}';
            } catch (_) {
              // Fallback to raw string if parsing fails.
              createdAtDisplay = createdAtRaw;
            }
          }

          final isClosed = ['paid', 'served', 'completed', 'canceled']
              .contains(status.toLowerCase());
          final canEdit = !isClosed;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Compact pill-style header summarizing table + status
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.08),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.table_restaurant,
                        size: 14,
                        color: Colors.white.withOpacity(0.72),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Table $table · ${status.isEmpty ? 'Order' : status}',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Color(0xFF0F172A),
                        Color(0xFF1E293B),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: const Color(0xFF34D399).withOpacity(0.4),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Table $table',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (customerName != null && customerName.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Placed by $customerName',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _buildStatusChip(status),
                          if (isClosed) ...[
                            const SizedBox(width: 8),
                            Text(
                              'Closed',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.6),
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(width: 8),
                          ] else
                            const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              createdAtDisplay,
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.6),
                                fontSize: 12,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                if (isClosed)
                  Container(
                    width: double.infinity,
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.02),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.08),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.info_outline_rounded,
                          size: 18,
                          color: Color(0xFF34D399),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'This order is closed, you can\'t add more items.',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                const Text(
                  'Items',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                if (details.isEmpty)
                  Text(
                    'No items in this order.',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: details.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final d = details[index] as Map<String, dynamic>;
                      final detailId = d['id']?.toString();
                      final qty = d['quantity'] ?? d['qty'] ?? 0;
                      final price = d['price_at_time'] ?? d['price'] ?? 0;
                      final lineTotal = (qty is num && price is num)
                          ? '\$${(qty * price).toStringAsFixed(2)}'
                          : '';
                      final menuData = d['Menu'] as Map<String, dynamic>?;
                      final name = menuData?['name'] ?? d['menu_name'] ?? 'Item';
                      final picture = menuData?['picture']?.toString();

                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFF1E293B),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 52,
                                  height: 52,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    color: const Color(0xFF020617),
                                  ),
                                  clipBehavior: Clip.antiAlias,
                                  child: (picture != null && picture.isNotEmpty)
                                      ? Image.network(
                                          _resolvePictureUrl(picture),
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => const Icon(
                                            Icons.restaurant_rounded,
                                            color: Color(0xFF34D399),
                                          ),
                                        )
                                      : const Icon(
                                          Icons.restaurant_rounded,
                                          color: Color(0xFF34D399),
                                        ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name.toString(),
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Qty: $qty  •  Price: ${price is num ? '\$${price.toStringAsFixed(2)}' : price}',
                                        style: TextStyle(
                                          color: Colors.white.withOpacity(0.7),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  lineTotal,
                                  style: const TextStyle(
                                    color: Color(0xFF34D399),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            if (canEdit && detailId != null) ...[
                              const SizedBox(height: 8),
                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton.icon(
                                  onPressed: () {
                                    _showVoidItemDialog(orderId, detailId);
                                  },
                                  icon: const Icon(
                                    Icons.do_not_disturb_on_rounded,
                                    size: 16,
                                    color: Color(0xFFEF4444),
                                  ),
                                  label: const Text(
                                    'Request void',
                                    style: TextStyle(
                                      color: Color(0xFFEF4444),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  style: TextButton.styleFrom(
                                    padding: EdgeInsets.zero,
                                    minimumSize: const Size(0, 0),
                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
                const SizedBox(height: 24),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.02),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.08),
                          ),
                        ),
                        child: Text(
                          orderSummaryLabel,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (!isClosed && totalAmount > 0) ...[
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: const Color(0xFF34D399).withOpacity(0.7),
                            ),
                            foregroundColor: const Color(0xFF34D399),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: _creatingPayment
                              ? null
                              : () => _showPaymentMethodSheet(
                                    orderId,
                                    totalAmount,
                                  ),
                          icon: _creatingPayment
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor:
                                        AlwaysStoppedAnimation<Color>(Color(0xFF34D399)),
                                  ),
                                )
                              : const Icon(Icons.payments_rounded, size: 18),
                          label: Text(
                            _creatingPayment ? 'Paying...' : 'Pay now',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        const Text(
                          'Total: ',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          '\$$total',
                          style: const TextStyle(
                            color: Color(0xFF34D399),
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (canEdit && tableNumber > 0) ...[
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF34D399),
                        foregroundColor: const Color(0xFF020617),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => MenuScreen(
                              tableNumber: tableNumber,
                              orderId: orderId,
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.add_shopping_cart_rounded),
                      label: const Text(
                        'Add items to this order',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.red.shade400.withOpacity(0.7)),
                        foregroundColor: Colors.red.shade400,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        _requestVoidOrder(orderId);
                      },
                      icon: const Icon(Icons.do_not_disturb_on_rounded, size: 18),
                      label: const Text(
                        'Request void order',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    final s = status.toLowerCase();
    Color color;
    switch (s) {
      case 'pending':
        color = const Color(0xFFF97316); // orange
        break;
      case 'in_progress':
        color = const Color(0xFF3B82F6); // blue
        break;
      case 'served':
      case 'completed':
        color = const Color(0xFF22C55E); // green
        break;
      case 'canceled':
        color = const Color(0xFFEF4444); // red
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withOpacity(0.6)),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
