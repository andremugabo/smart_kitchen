import 'package:flutter/material.dart';
import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/order_service.dart';
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
    _futureOrder = _orderService.getOrder(widget.orderId);
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
          final total = (order['total_amount'] ?? 0).toString();
          final createdAt = (order['order_date'] ?? '').toString();
          final details = (order['order_details'] ?? order['OrderDetails'] ?? []) as List<dynamic>;

          final orderId = order['id']?.toString() ?? widget.orderId;
          final tableNumber = order['table_number'] is int
              ? order['table_number'] as int
              : int.tryParse(order['table_number']?.toString() ?? '0') ?? 0;

          final isClosed = ['served', 'completed', 'canceled'].contains(status.toLowerCase());
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
                              createdAt,
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
                      final qty = d['quantity'] ?? d['qty'] ?? 0;
                      final price = d['price_at_time'] ?? d['price'] ?? 0;
                      final lineTotal = (qty is num && price is num)
                          ? (qty * price).toString()
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
                        child: Row(
                          children: [
                            // Thumbnail
                            Container
                              (
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
                                    'Qty: $qty  •  Price: $price',
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
                      );
                    },
                  ),
                const SizedBox(height: 24),
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
                      total,
                      style: const TextStyle(
                        color: Color(0xFF34D399),
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (canEdit && tableNumber > 0)
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
