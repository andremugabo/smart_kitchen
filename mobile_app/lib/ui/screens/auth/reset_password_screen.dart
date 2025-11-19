import 'package:flutter/material.dart';
import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/auth_service.dart';
import 'package:mobile_app/ui/widgets/app_text_field.dart';
import 'package:mobile_app/ui/widgets/primary_button.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _loading = false;
  bool _obscure1 = true;
  bool _obscure2 = true;
  final _auth = AuthService();
  String? _email;
  String? _otp;

  // Password strength indicators
  bool _hasMinLength = false;
  bool _hasUppercase = false;
  bool _hasLowercase = false;
  bool _hasDigit = false;
  bool _hasSpecialChar = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is Map) {
      _email ??= args['email'] as String?;
      _otp ??= args['otp'] as String?;
    }
  }

  void _checkPasswordStrength(String password) {
    setState(() {
      _hasMinLength = password.length >= 8;
      _hasUppercase = password.contains(RegExp(r'[A-Z]'));
      _hasLowercase = password.contains(RegExp(r'[a-z]'));
      _hasDigit = password.contains(RegExp(r'[0-9]'));
      _hasSpecialChar = password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'));
    });
  }

  int _getPasswordStrength() {
    int strength = 0;
    if (_hasMinLength) strength++;
    if (_hasUppercase) strength++;
    if (_hasLowercase) strength++;
    if (_hasDigit) strength++;
    if (_hasSpecialChar) strength++;
    return strength;
  }

  Color _getStrengthColor() {
    final strength = _getPasswordStrength();
    if (strength <= 2) return const Color(0xFFEF4444);
    if (strength == 3) return const Color(0xFFF59E0B);
    if (strength == 4) return const Color(0xFF3B82F6);
    return const Color(0xFF10B981);
  }

  String _getStrengthLabel() {
    final strength = _getPasswordStrength();
    if (strength <= 2) return 'Weak';
    if (strength == 3) return 'Fair';
    if (strength == 4) return 'Good';
    return 'Strong';
  }

  Future<void> _handleReset() async {
    if (!_formKey.currentState!.validate()) return;

    // Dismiss keyboard
    FocusScope.of(context).unfocus();

    setState(() => _loading = true);

    try {
      if (_email == null || _otp == null || _email!.isEmpty || _otp!.isEmpty) {
        if (!mounted) return;
        _showErrorSnackbar('Missing email or OTP. Please start reset flow again.');
        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
        return;
      }

      final newPassword = _passwordController.text;
      await _auth.resetPasswordWithOtp(
        email: _email!,
        otp: _otp!,
        newPassword: newPassword,
      );

      if (!mounted) return;

      _showSuccessSnackbar('Password reset successful!');

      // Small delay to show success message
      await Future.delayed(const Duration(milliseconds: 1000));

      if (!mounted) return;
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    } on ApiException catch (e) {
      if (!mounted) return;
      _showErrorSnackbar(e.message);
    } catch (e) {
      if (!mounted) return;
      _showErrorSnackbar('Failed to reset password. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showSuccessSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: const Color(0xFFEF4444),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Must contain at least one uppercase letter';
    }
    if (!value.contains(RegExp(r'[a-z]'))) {
      return 'Must contain at least one lowercase letter';
    }
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Must contain at least one number';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final strength = _getPasswordStrength();
    final strengthColor = _getStrengthColor();

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF020617), Color(0xFF0F172A), Colors.black],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 440),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Back button
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: const Color(0xFF334155),
                              width: 1,
                            ),
                          ),
                          child: const Icon(
                            Icons.arrow_back_ios_new,
                            color: Colors.white70,
                            size: 16,
                          ),
                        ),
                        padding: EdgeInsets.zero,
                        onPressed: _loading ? null : () => Navigator.pop(context),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Icon
                    Center(
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: const Color(0xFF334155),
                            width: 1,
                          ),
                        ),
                        child: const Icon(
                          Icons.lock_reset,
                          color: Color(0xFF34D399),
                          size: 32,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Title
                    const Text(
                      'Create new password',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Description
                    const Text(
                      'Your new password must be different from previously used passwords.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Form
                    Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AppTextField(
                            controller: _passwordController,
                            label: 'New password',
                            obscureText: _obscure1,
                            textInputAction: TextInputAction.next,
                            enabled: !_loading,
                            prefixIcon: const Icon(
                              Icons.lock_outline,
                              color: Colors.white54,
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscure1
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                color: Colors.white54,
                              ),
                              onPressed: _loading
                                  ? null
                                  : () => setState(() => _obscure1 = !_obscure1),
                            ),
                            onChanged: _checkPasswordStrength,
                            validator: _validatePassword,
                          ),

                          // Password strength indicator
                          if (_passwordController.text.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: strength / 5,
                                      minHeight: 6,
                                      backgroundColor: const Color(0xFF334155),
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        strengthColor,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  _getStrengthLabel(),
                                  style: TextStyle(
                                    color: strengthColor,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // Password requirements
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B).withOpacity(0.5),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: const Color(0xFF334155),
                                  width: 1,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildRequirement(
                                    'At least 8 characters',
                                    _hasMinLength,
                                  ),
                                  _buildRequirement(
                                    'One uppercase letter',
                                    _hasUppercase,
                                  ),
                                  _buildRequirement(
                                    'One lowercase letter',
                                    _hasLowercase,
                                  ),
                                  _buildRequirement(
                                    'One number',
                                    _hasDigit,
                                  ),
                                  _buildRequirement(
                                    'One special character',
                                    _hasSpecialChar,
                                  ),
                                ],
                              ),
                            ),
                          ],

                          const SizedBox(height: 16),

                          AppTextField(
                            controller: _confirmPasswordController,
                            label: 'Confirm password',
                            obscureText: _obscure2,
                            textInputAction: TextInputAction.done,
                            enabled: !_loading,
                            prefixIcon: const Icon(
                              Icons.lock_outline,
                              color: Colors.white54,
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscure2
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                color: Colors.white54,
                              ),
                              onPressed: _loading
                                  ? null
                                  : () => setState(() => _obscure2 = !_obscure2),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please confirm your password';
                              }
                              if (value != _passwordController.text) {
                                return 'Passwords do not match';
                              }
                              return null;
                            },
                            onFieldSubmitted: (_) => _handleReset(),
                          ),

                          const SizedBox(height: 24),

                          PrimaryButton(
                            label: 'Reset password',
                            loading: _loading,
                            onPressed: _handleReset,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Back to login
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Remember your password?',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(width: 4),
                        TextButton(
                          onPressed: _loading
                              ? null
                              : () => Navigator.pushNamedAndRemoveUntil(
                            context,
                            '/login',
                                (route) => false,
                          ),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4,
                              vertical: 0,
                            ),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text(
                            'Sign in',
                            style: TextStyle(
                              color: Color(0xFF34D399),
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRequirement(String text, bool met) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(
            met ? Icons.check_circle : Icons.circle_outlined,
            color: met ? const Color(0xFF10B981) : Colors.white38,
            size: 16,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: met ? Colors.white70 : Colors.white54,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}