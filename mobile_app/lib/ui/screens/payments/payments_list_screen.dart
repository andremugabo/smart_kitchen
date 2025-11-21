import 'package:flutter/material.dart';
import 'package:mobile_app/services/payment_service.dart';
import 'package:mobile_app/services/auth_storage.dart';
import 'package:mobile_app/ui/screens/payments/payment_details_screen.dart';

class PaymentsListScreen extends StatefulWidget {
  const PaymentsListScreen({super.key});

  @override
  State<PaymentsListScreen> createState() => _PaymentsListScreenState();
}

class _PaymentsListScreenState extends State<PaymentsListScreen> {
  final PaymentService _paymentService = PaymentService();
  late Future<List<Map<String, dynamic>>> _futurePayments;
  String? _role;
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    _futurePayments = _load();
  }

  Future<List<Map<String, dynamic>>> _load() async {
    _role = await AuthStorage.getRole();
    final normalized = _role?.toLowerCase();
    if (normalized != 'admin' && normalized != 'manager') {
      return <Map<String, dynamic>>[];
    }
    return _paymentService.listPayments();
  }

  @override
  Widget build(BuildContext context) {
    final normalized = _role?.toLowerCase();

    if (normalized != null && normalized != 'admin' && normalized != 'manager') {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Text(
            'Payments are only available for manager/admin accounts.',
            style: TextStyle(color: Colors.white70),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _futurePayments,
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
                'Failed to load payments: ${snapshot.error}',
                style: TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),
            ),
          );
        }

        final items = snapshot.data ?? const [];
        if (items.isEmpty) {
          return const Center(
            child: Text(
              'No payments found',
              style: TextStyle(color: Colors.white70),
            ),
          );
        }

        final filtered = items.where((p) {
          final raw = p['status']?.toString().toLowerCase() ?? '';
          switch (_statusFilter) {
            case 'paid':
              return raw == 'paid';
            case 'pending':
              return raw == 'pending';
            case 'failed':
              return raw == 'failed';
            case 'refunded':
              return raw == 'refunded';
            default:
              return true;
          }
        }).toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('All', 'all'),
                    _buildFilterChip('Paid', 'paid'),
                    _buildFilterChip('Pending', 'pending'),
                    _buildFilterChip('Failed', 'failed'),
                    _buildFilterChip('Refunded', 'refunded'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemBuilder: (context, index) {
                  final p = filtered[index];
                  final id = p['id']?.toString() ?? '';
                  final amount = (p['amount'] ?? 0).toString();
                  final method = p['method']?.toString() ?? '-';
                  final status = p['status']?.toString() ?? '-';

                  return ListTile(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    tileColor: const Color(0xFF0F172A),
                    onTap: () {
                      if (id.isEmpty) return;
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => PaymentDetailsScreen(paymentId: id),
                        ),
                      );
                    },
                    title: Text(
                      'Payment $id',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                    ),
                    subtitle: Row(
                      children: [
                        _buildStatusChip(status),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Amount: $amount  •  $method',
                            style: TextStyle(color: Colors.white.withOpacity(0.7)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  );
                },
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemCount: filtered.length,
              ),
            ),
          ],
        );
      },
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
      case 'paid':
        color = const Color(0xFF22C55E);
        break;
      case 'pending':
        color = const Color(0xFFF97316);
        break;
      case 'failed':
        color = const Color(0xFFEF4444);
        break;
      case 'refunded':
        color = const Color(0xFF3B82F6);
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
