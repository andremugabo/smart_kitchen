import 'package:flutter/material.dart';
import 'package:mobile_app/services/order_service.dart';
import 'package:mobile_app/services/auth_storage.dart';

class OrdersListScreen extends StatefulWidget {
  const OrdersListScreen({super.key});

  @override
  State<OrdersListScreen> createState() => _OrdersListScreenState();
}

class _OrdersListScreenState extends State<OrdersListScreen> {
  final OrderService _orderService = OrderService();
  late Future<List<dynamic>> _futureOrders;
  String? _role;
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    _futureOrders = _loadOrders();
  }

  Future<List<dynamic>> _loadOrders() async {
    _role = await AuthStorage.getRole();
    final normalizedRole = _role?.toLowerCase();
    if (normalizedRole == 'waiter') {
      return _orderService.getCurrentWaiterOrders();
    }
    return _orderService.listOrders();
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
          'Orders',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _futureOrders,
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
                  'Failed to load orders: ${snapshot.error}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final orders = snapshot.data ?? [];
          if (orders.isEmpty) {
            return Center(
              child: Text(
                'No active orders',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 16,
                ),
              ),
            );
          }

          final filtered = orders.where((raw) {
            if (_statusFilter == 'all') return true;
            if (raw is! Map<String, dynamic>) return true;
            final s = (raw['status'] ?? '').toString().toLowerCase();
            switch (_statusFilter) {
              case 'pending':
                return s == 'pending';
              case 'in_progress':
                return s == 'in_progress' || s == 'preparing';
              case 'served':
                return s == 'served';
              case 'completed':
                return s == 'completed';
              case 'canceled':
                return s == 'canceled' || s == 'cancelled';
              default:
                return true;
            }
          }).toList();

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
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
                          _role == 'waiter'
                              ? Icons.table_restaurant
                              : Icons.lock_outline,
                          size: 14,
                          color: Colors.white.withOpacity(0.7),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _role == 'waiter'
                              ? 'Your active tables'
                              : 'All orders (read-only)',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
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
                      _buildFilterChip('All', 'all'),
                      _buildFilterChip('Pending', 'pending'),
                      _buildFilterChip('In Progress', 'in_progress'),
                      _buildFilterChip('Served', 'served'),
                      _buildFilterChip('Completed', 'completed'),
                      _buildFilterChip('Canceled', 'canceled'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
              final o = filtered[index] as Map<String, dynamic>;
              final id = o['id']?.toString() ?? '';
              final table = o['table_number']?.toString() ?? '-';
              final status = o['status']?.toString() ?? '';
              final total = (o['total_amount'] ?? 0).toString();

              return ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                tileColor: const Color(0xFF0F172A),
                title: Text(
                  'Table $table',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Row(
                  children: [
                    _buildStatusChip(status),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Total: $total',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                onTap: () {
                  Navigator.of(context).pushNamed(
                    '/order-details',
                    arguments: id,
                  );
                },
              );
            },
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemCount: filtered.length,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final selected = _statusFilter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) {
          setState(() {
            _statusFilter = value;
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
 
  Widget _buildStatusChip(String status) {
    final s = status.toLowerCase();
    Color color;
    switch (s) {
      case 'pending':
      case 'preparing':
        color = const Color(0xFFF97316); // orange
        break;
      case 'served':
      case 'completed':
        color = const Color(0xFF22C55E); // green
        break;
      case 'canceled':
      case 'cancelled':
        color = const Color(0xFFEF4444); // red
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withOpacity(0.6)),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
