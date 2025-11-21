import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/models/menu.dart';

class MenuService {
  MenuService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  Future<List<Menu>> listMenus({int page = 1, int limit = 50}) async {
    final response = await _api.get('/menus?page=$page&limit=$limit');
    final data = response['data'];

    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map((json) => Menu.fromJson(json))
          .toList();
    }

    return const <Menu>[];
  }

  Future<Menu> getMenu(String id) async {
    final response = await _api.get('/menus/$id');
    final data = response['data'];
    if (data is Map<String, dynamic>) {
      return Menu.fromJson(data);
    }
    throw ApiException(statusCode: 500, message: 'Invalid menu response');
  }
}

