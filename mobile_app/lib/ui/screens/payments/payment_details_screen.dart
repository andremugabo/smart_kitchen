import 'package:flutter/material.dart';
import 'package:mobile_app/services/payment_service.dart';

class PaymentDetailsScreen extends StatefulWidget {
  const PaymentDetailsScreen({super.key, required this.paymentId});

  final String paymentId;

  @override
  State<PaymentDetailsScreen> createState() => _PaymentDetailsScreenState();
}

class _PaymentDetailsScreenState extends State<PaymentDetailsScreen> {
  final PaymentService _paymentService = PaymentService();
  late Future<Map<String, dynamic>> _futurePayment;

  String _formatOrderCode(String id) {
    if (id.isEmpty) return 'ORD-????';
    final core = id.length > 4 ? id.substring(0, 4) : id;
    return 'ORD-${core.toUpperCase()}';
  }

  String _formatPaymentCode(String id) {
    if (id.isEmpty) return 'PAY-????';
    final core = id.length > 4 ? id.substring(0, 4) : id;
    return 'PAY-${core.toUpperCase()}';
  }

  @override
  void initState() {
    super.initState();
    _futurePayment = _paymentService.getPayment(widget.paymentId);
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
          'Payment details',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _futurePayment,
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
                  'Failed to load payment: ${snapshot.error}',
                  style: TextStyle(color: Colors.white.withOpacity(0.7)),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final p = snapshot.data;
          if (p == null) {
            return const Center(
              child: Text(
                'Payment not found',
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          final id = p['id']?.toString() ?? widget.paymentId;
          final amount = (p['amount'] ?? 0).toString();
          final method = p['method']?.toString() ?? '-';
          final status = p['status']?.toString() ?? '-';
          final orderId = p['order_id']?.toString();
          final dateRaw = p['payment_date']?.toString() ?? '';

          final orderData = p['Order'] as Map<String, dynamic>?;
          final table = orderData?['table_number']?.toString();
          final userData = orderData?['User'] as Map<String, dynamic>?;
          String? customerName;
          if (userData != null) {
            customerName = (userData['username'] ??
                    userData['name'] ??
                    userData['full_name'] ??
                    userData['email'])
                ?.toString();
          }

          final paymentCode = _formatPaymentCode(id);

          String dateDisplay = dateRaw;
          if (dateRaw.isNotEmpty) {
            try {
              final dt = DateTime.parse(dateRaw).toLocal();
              String two(int v) => v.toString().padLeft(2, '0');
              dateDisplay =
                  '${dt.year}-${two(dt.month)}-${two(dt.day)} ${two(dt.hour)}:${two(dt.minute)}';
            } catch (_) {
              dateDisplay = dateRaw;
            }
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                        Icons.payments_rounded,
                        size: 14,
                        color: Colors.white.withOpacity(0.72),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          '$paymentCode · ${status.isEmpty ? 'Status' : status}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(20),
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
                        paymentCode,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (customerName != null && customerName.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          'By $customerName${table != null && table.isNotEmpty ? ' · Table $table' : ''}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _buildStatusChip(status),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              dateDisplay,
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
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
                _buildInfoRow('Amount', amount),
                _buildInfoRow('Method', method),
                if (orderId != null) ...[
                  _buildInfoRow('Order', _formatOrderCode(orderId)),
                  const SizedBox(height: 8),
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
                      onPressed: () {
                        Navigator.of(context).pushNamed(
                          '/order-details',
                          arguments: orderId,
                        );
                      },
                      icon: const Icon(Icons.receipt_long),
                      label: const Text(
                        'Open Order Details',
                        style: TextStyle(fontWeight: FontWeight.w600),
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

  Widget _buildInfoRow(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
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
