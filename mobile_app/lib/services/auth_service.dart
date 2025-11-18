import 'package:mobile_app/services/api_client.dart';

class AuthService {
  AuthService({ApiClient? apiClient}) : _api = apiClient ?? ApiClient();

  final ApiClient _api;

  Future<Map<String, dynamic>> login({
    required String emailOrUsername,
    required String password,
  }) async {
    final result = await _api.post(
      '/users/login',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"emailOrUsername":"$emailOrUsername","password":"$password"}',
    );

    return result;
  }
}
