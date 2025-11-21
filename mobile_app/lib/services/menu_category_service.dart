import 'package:mobile_app/services/api_client.dart';

class MenuCategoryService {
  MenuCategoryService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  Future<List<Map<String, dynamic>>> listMenuCategories() async {
    final response = await _api.get('/menu-categories');
    final data = response['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }
    throw Exception('Invalid menu categories response');
  }
}
