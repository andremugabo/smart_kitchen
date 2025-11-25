import 'package:flutter/material.dart';
import 'package:mobile_app/services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final NotificationService _notificationService = NotificationService();
  late Future<List<Map<String, dynamic>>> _futureNotifications;
  bool _allMarkedRead = false;

  String _formatOrderCode(String id) {
    if (id.isEmpty) return 'ORD-????';
    final core = id.length > 4 ? id.substring(0, 4) : id;
    return 'ORD-${core.toUpperCase()}';
  }

  @override
  void initState() {
    super.initState();
    _futureNotifications = _notificationService.listUserNotifications();
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
          'Notifications',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          TextButton.icon(
            onPressed: () async {
              try {
                await _notificationService.markAllAsRead();
                setState(() {
                  _allMarkedRead = true;
                  _futureNotifications = _notificationService.listUserNotifications();
                });
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Failed to mark all as read: $e'),
                  ),
                );
              }
            },
            icon: const Icon(
              Icons.done_all,
              size: 18,
              color: Color(0xFF34D399),
            ),
            label: const Text(
              'Mark all as read',
              style: TextStyle(
                color: Color(0xFF34D399),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _futureNotifications,
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
                  'Failed to load notifications: ${snapshot.error}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          final items = snapshot.data ?? const [];
          if (items.isEmpty) {
            return const Center(
              child: Text(
                'No notifications yet',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final n = items[index];
              final title = n['title']?.toString() ?? 'Notification';
              final body = n['message']?.toString() ?? '';
              final isRead = (_allMarkedRead || n['is_read'] == true);
              final createdAt = n['created_at']?.toString() ?? '';
              final type = n['type']?.toString();
              final orderId = n['order_id']?.toString();
              final orderCode =
                  orderId != null && orderId.isNotEmpty ? _formatOrderCode(orderId) : null;

              return InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () {
                  _showNotificationDetails(context, n);
                },
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.06),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isRead
                              ? Colors.white.withOpacity(0.05)
                              : const Color(0xFF34D399).withOpacity(0.2),
                        ),
                        child: Icon(
                          isRead ? Icons.notifications_none : Icons.notifications_active,
                          size: 18,
                          color: isRead
                              ? Colors.white.withOpacity(0.7)
                              : const Color(0xFF34D399),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    title,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                                if (createdAt.isNotEmpty)
                                  Text(
                                    createdAt,
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.5),
                                      fontSize: 11,
                                    ),
                                  ),
                              ],
                            ),
                            if (body.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                body,
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.75),
                                  fontSize: 13,
                                ),
                              ),
                            ],
                            if (orderCode != null && type == 'payment')
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  'Related order: $orderCode',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.6),
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showNotificationDetails(BuildContext context, Map<String, dynamic> n) {
    final title = n['title']?.toString() ?? 'Notification';
    final body = n['message']?.toString() ?? '';
    final createdAt = n['created_at']?.toString() ?? '';
    final type = n['type']?.toString();
    final orderId = n['order_id']?.toString();

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF020617),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Notification details',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 18),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (createdAt.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  createdAt,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 12,
                  ),
                ),
              ],
              if (body.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  body,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.85),
                    fontSize: 14,
                  ),
                ),
              ],
              if (orderId != null && orderId.isNotEmpty && type == 'payment') ...[
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF34D399),
                    side: const BorderSide(color: Color(0xFF34D399)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).pushNamed(
                      '/order-details',
                      arguments: orderId,
                    );
                  },
                  icon: const Icon(Icons.receipt_long),
                  label: const Text('Open related order'),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
