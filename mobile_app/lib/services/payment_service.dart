import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/auth_storage.dart';

class PaymentService {
  PaymentService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  Future<List<Map<String, dynamic>>> listPayments({int page = 1, int limit = 20}) async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final response = await _api.get(
      '/payments?page=$page&limit=$limit',
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

    throw Exception('Invalid payments response');
  }

  Future<Map<String, dynamic>> getPayment(String id) async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final response = await _api.get(
      '/payments/$id',
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data);
    }

    throw Exception('Invalid payment response');
  }

  Future<Map<String, dynamic>> createPayment({
    required String orderId,
    required double amount,
    required String method,
    String status = 'paid',
  }) async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final response = await _api.post(
      '/payments',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: '{"order_id":"$orderId","amount":$amount,"method":"$method","status":"$status"}',
    );

    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data);
    }

    throw Exception('Invalid create payment response');
  }
}
