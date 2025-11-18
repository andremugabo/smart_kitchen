import 'package:flutter/material.dart';
import 'package:mobile_app/ui/screens/auth/forgot_password_screen.dart';
import 'package:mobile_app/ui/screens/auth/login.dart';
import 'package:mobile_app/ui/screens/auth/otp_screen.dart';
import 'package:mobile_app/ui/screens/auth/reset_password_screen.dart';
import 'package:mobile_app/ui/screens/home/home_screen.dart';
import 'package:mobile_app/ui/screens/splash_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Skitchen',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: Colors.white),
        ),
        useMaterial3: true,
      ),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/forgot-password': (context) => const ForgotPasswordScreen(),
        '/otp': (context) => const OtpScreen(),
        '/reset-password': (context) => const ResetPasswordScreen(),
      },
    );
  }
}
