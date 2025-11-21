import 'dart:convert';

import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/auth_storage.dart';

class OrderService {
  OrderService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  /// Create a new order with initial items.
  /// Matches backend POST /orders payload.
  Future<Map<String, dynamic>> createOrder({
    required int tableNumber,
    required List<Map<String, dynamic>> items,
  }) async {
    final userId = await AuthStorage.getUserId();
    final token = await AuthStorage.getToken();

    if (userId == null || userId.isEmpty || token == null || token.isEmpty) {
      throw Exception('Missing user id or token');
    }

    final body = json.encode({
      'user_id': userId,
      'table_number': tableNumber,
      'items': items,
    });

    final response = await _api.post(
      '/orders',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: body,
    );

    return response;
  }

  /// List all orders (GET /orders).
  Future<List<dynamic>> listOrders() async {
    final response = await _api.get('/orders');
    final data = response['data'];
    if (data is List) {
      return data;
    }
    throw Exception('Invalid orders list response');
  }

  /// Add items to an existing order.
  /// Matches backend POST /orders/:id/items payload.
  Future<Map<String, dynamic>> addItemsToOrder({
    required String orderId,
    required List<Map<String, dynamic>> items,
  }) async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final body = json.encode({
      'items': items,
    });

    final response = await _api.post(
      '/orders/$orderId/items',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: body,
    );

    return response;
  }

  /// Get current waiter's active orders (GET /orders/waiter/current).
  Future<List<dynamic>> getCurrentWaiterOrders() async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final response = await _api.get(
      '/orders/waiter/current',
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    // Backend shape: { success: true, data: { stats: {...}, openOrders: [...] } }
    final data = response['data'];

    if (data is Map<String, dynamic>) {
      final inner = data;
      final openOrders = inner['openOrders'];

      if (openOrders is List) {
        // Normalize keys so the UI can treat waiter/open orders like regular orders.
        // Backend uses camelCase (tableNumber, totalAmount, orderDate), while
        // the generic orders list uses snake_case (table_number, total_amount, order_date).
        return openOrders.map((o) {
          if (o is Map<String, dynamic>) {
            return {
              'id': o['id'],
              'table_number': o['tableNumber'],
              'status': o['status'],
              'total_amount': o['totalAmount'],
              'order_date': o['orderDate'],
            };
          }
          return o;
        }).toList();
      }
    }

    throw Exception('Invalid waiter orders response');
  }

  /// Get current waiter overview with stats and open orders (raw shape).
  /// Useful for dashboards that need tablesAssigned and openOrdersCount.
  Future<Map<String, dynamic>> getCurrentWaiterOverview() async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final response = await _api.get(
      '/orders/waiter/current',
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data);
    }

    throw Exception('Invalid waiter overview response');
  }

  /// Get a single order with details (GET /orders/:id).
  Future<Map<String, dynamic>> getOrder(String orderId) async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final response = await _api.get(
      '/orders/$orderId',
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data);
    }
    throw Exception('Invalid order details response');
  }
}
