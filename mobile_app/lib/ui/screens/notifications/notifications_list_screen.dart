import 'package:flutter/material.dart';
import 'package:mobile_app/services/notification_service.dart';
import 'package:mobile_app/ui/screens/notifications/notification_details_screen.dart';

class NotificationsListScreen extends StatefulWidget {
  const NotificationsListScreen({super.key});

  @override
  State<NotificationsListScreen> createState() => _NotificationsListScreenState();
}

class _NotificationsListScreenState extends State<NotificationsListScreen> {
  final NotificationService _notificationService = NotificationService();
  late Future<List<Map<String, dynamic>>> _future;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _future = _notificationService.listUserNotifications();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _future,
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
              'No notifications',
              style: TextStyle(color: Colors.white70),
            ),
          );
        }

        final filtered = items.where((n) {
          final type = n['type']?.toString() ?? 'system';
          final isRead = n['is_read'] == true;

          switch (_filter) {
            case 'unread':
              return !isRead;
            case 'payment':
              return type == 'payment';
            case 'order':
              return type == 'order';
            case 'inventory':
              return type == 'inventory';
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
                    _buildFilterChip('Unread', 'unread'),
                    _buildFilterChip('Payments', 'payment'),
                    _buildFilterChip('Orders', 'order'),
                    _buildFilterChip('Inventory', 'inventory'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemBuilder: (context, index) {
                  final n = filtered[index];
                  final title = n['title']?.toString() ?? 'Notification';
                  final message = n['message']?.toString() ?? '';
                  final type = n['type']?.toString() ?? 'system';
                  final isRead = n['is_read'] == true;

                  return ListTile(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    tileColor: const Color(0xFF0F172A),
                    leading: Icon(
                      type == 'payment'
                          ? Icons.payments_outlined
                          : type == 'order'
                              ? Icons.receipt_long
                              : type == 'inventory'
                                  ? Icons.inventory_2_outlined
                                  : Icons.notifications_none,
                      color: isRead ? Colors.white54 : const Color(0xFF34D399),
                    ),
                    title: Text(
                      title,
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: isRead ? FontWeight.w400 : FontWeight.w600,
                      ),
                    ),
                    subtitle: Text(
                      message,
                      style: TextStyle(color: Colors.white.withOpacity(0.7)),
                    ),
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => NotificationDetailsScreen(notification: n),
                        ),
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
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final selected = _filter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) {
          setState(() {
            _filter = value;
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
}
