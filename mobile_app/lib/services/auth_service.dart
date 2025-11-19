import 'dart:convert';

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
      body: jsonEncode({
        'emailOrUsername': emailOrUsername,
        'password': password,
      }),
    );

    return result;
  }

  Future<Map<String, dynamic>> requestPasswordOtp({
    required String email,
  }) async {
    final result = await _api.post(
      '/users/password/otp',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'email': email}),
    );

    return result;
  }

  Future<Map<String, dynamic>> resetPasswordWithOtp({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    final result = await _api.post(
      '/users/password/reset',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'email': email,
        'otp': otp,
        'newPassword': newPassword,
      }),
    );

    return result;
  }
}
