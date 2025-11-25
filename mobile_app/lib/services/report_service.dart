import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/auth_storage.dart';

class ReportService {
  ReportService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  Future<Map<String, dynamic>> getSalesSummary() async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    final response = await _api.get(
      '/reports/sales-summary',
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data);
    }

    throw Exception('Invalid sales summary response');
  }

  Future<Map<String, dynamic>> getMenuPerformance({DateTime? from, DateTime? to}) async {
    final token = await AuthStorage.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('Missing token');
    }

    var path = '/reports/menu-performance';
    if (from != null || to != null) {
      final params = <String>[];
      if (from != null) {
        params.add('from=${from.toIso8601String()}');
      }
      if (to != null) {
        params.add('to=${to.toIso8601String()}');
      }
      path = '$path?${params.join('&')}';
    }

    final response = await _api.get(
      path,
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return Map<String, dynamic>.from(data);
    }

    throw Exception('Invalid menu performance response');
  }
}
