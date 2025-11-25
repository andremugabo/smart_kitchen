import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/auth_storage.dart';

class NotificationService {
  NotificationService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  Future<List<Map<String, dynamic>>> listUserNotifications() async {
    final token = await AuthStorage.getToken();
    final userId = await AuthStorage.getUserId();

    if (token == null || token.isEmpty || userId == null || userId.isEmpty) {
      throw Exception('Missing token or user id');
    }

    final response = await _api.get(
      '/notifications/user/$userId',
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    final data = response['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }

    throw Exception('Invalid notifications response');
  }

  /// Mark all notifications for the current user as read.
  /// Uses PATCH /notifications/user/:userId/mark-all-read
  /// and the Authorization header to identify the user.
  Future<void> markAllAsRead() async {
    final token = await AuthStorage.getToken();
    final userId = await AuthStorage.getUserId();
    if (token == null || token.isEmpty || userId == null || userId.isEmpty) {
      throw Exception('Missing token or user id');
    }

    await _api.post(
      '/notifications/user/$userId/mark-all-read',
      headers: {
        'Authorization': 'Bearer $token',
      },
    );
  }
}
