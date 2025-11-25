import 'dart:convert';

import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/auth_storage.dart';

class OrderChangeRequestService {
  OrderChangeRequestService({ApiClient? apiClient})
      : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  Future<Map<String, dynamic>> createRequest({
    required String orderId,
    String? orderDetailId,
    required String type,
    String? reason,
  }) async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final body = json.encode({
      'order_id': orderId,
      if (orderDetailId != null) 'order_detail_id': orderDetailId,
      'type': type,
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });

    final response = await _api.post(
      '/order-change-requests',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: body,
    );

    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data);
    }
    throw Exception('Invalid order change request response');
  }

  Future<List<Map<String, dynamic>>> listPendingForOrder(String orderId) async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final response = await _api.get(
      '/order-change-requests?order_id=$orderId&status=pending',
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
    throw Exception('Invalid order change request list response');
  }
}
