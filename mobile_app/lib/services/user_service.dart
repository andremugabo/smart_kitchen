import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/auth_storage.dart';

class UserService {
  UserService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  Future<Map<String, dynamic>> getProfile() async {
    final userId = await AuthStorage.getUserId();
    final token = await AuthStorage.getToken();

    if (userId == null || userId.isEmpty || token == null || token.isEmpty) {
      throw Exception('Missing user id or token');
    }

    final result = await _api.get(
      '/users/$userId',
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    return result;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final userId = await AuthStorage.getUserId();
    final token = await AuthStorage.getToken();

    if (userId == null || userId.isEmpty || token == null || token.isEmpty) {
      throw Exception('Missing user id or token');
    }

    final result = await _api.put(
      '/users/$userId',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    );

    return result;
  }

  Future<Map<String, dynamic>> updateProfileImage(File imageFile) async {
    final userId = await AuthStorage.getUserId();
    final token = await AuthStorage.getToken();

    if (userId == null || userId.isEmpty || token == null || token.isEmpty) {
      throw Exception('Missing user id or token');
    }

    final uri = Uri.parse('${ApiClient.baseUrl}/users/$userId/image');
    final request = http.MultipartRequest('PUT', uri);
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final decoded = json.decode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    throw ApiException(
      statusCode: response.statusCode,
      message: decoded['error']?.toString() ?? 'Request failed',
    );
  }
}
