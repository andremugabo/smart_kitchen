import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile_app/services/api_client.dart';
import 'package:mobile_app/services/auth_storage.dart';
import 'package:mobile_app/services/user_service.dart';
import 'package:mobile_app/ui/screens/profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  String? _role;
  String? _username;
  String? _pictureUrl;
  String? _email;
  bool? _isActive;
  String? _createdAt;
  int _selectedIndex = 0;
  bool _isLoading = true;

  late AnimationController _fabController;
  late Animation<double> _fabScaleAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _loadRole();
    _setSystemUIOverlay();
  }

  void _setupAnimations() {
    _fabController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _fabScaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fabController, curve: Curves.elasticOut),
    );
  }

  void _setSystemUIOverlay() {
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: Colors.black,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
    );
  }

  @override
  void dispose() {
    _fabController.dispose();
    super.dispose();
  }

  Future<void> _loadRole() async {
    final token = await AuthStorage.getToken();
    String? derivedRole;

    if (token != null && token.isNotEmpty) {
      try {
        final decoded = JwtDecoder.decode(token);
        derivedRole = decoded['role']?.toString();
      } catch (_) {}
    }

    final storedRole = await AuthStorage.getRole();
    var username = await AuthStorage.getUsername();
    var picture = await AuthStorage.getPicture();
    var email = await AuthStorage.getEmail();
    bool? isActive;
    String? createdAt;

    try {
      final userService = UserService();
      final result = await userService.getProfile();
      final user = result['user'] as Map<String, dynamic>?;
      if (user != null) {
        username = user['username']?.toString() ?? username;
        email = user['email']?.toString() ?? email;
        picture = user['picture']?.toString() ?? picture;
        isActive = user['isActive'] as bool?;
        createdAt = user['created_at']?.toString();
      }
    } on ApiException catch (_) {
    } catch (_) {}

    if (!mounted) return;
    setState(() {
      _role = derivedRole ?? storedRole;
      _username = username;
      _pictureUrl = picture;
      _email = email;
      _isActive = isActive;
      _createdAt = createdAt;
      _isLoading = false;
    });
  }

  String _initialsFromName(String? name) {
    if (name == null || name.trim().isEmpty) return '';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  List<_DashboardCardData> _cardsForRole(String? role) {
    switch (role) {
      case 'admin':
        return [
          _DashboardCardData('Users', '12', Icons.people_outline, Colors.blue),
          _DashboardCardData('Menus', '8', Icons.restaurant_menu, Colors.purple),
          _DashboardCardData('Inventory', '42', Icons.inventory_2_outlined, Colors.orange),
          _DashboardCardData('Purchase', '17', Icons.receipt_long, Colors.green),
        ];
      case 'chef':
        return [
          _DashboardCardData('In Kitchen', '9', Icons.local_dining, Colors.red),
          _DashboardCardData('Pending', '5', Icons.timer_outlined, Colors.orange),
          _DashboardCardData('Recipes', '23', Icons.menu_book_outlined, Colors.blue),
          _DashboardCardData('Low Stock', '3', Icons.warning_amber_outlined, Colors.amber),
        ];
      case 'waiter':
        return [
          _DashboardCardData('Open Tables', '4', Icons.table_restaurant, Colors.blue),
          _DashboardCardData('Active Orders', '7', Icons.receipt_long, Colors.green),
          _DashboardCardData('Bills', '2', Icons.payments_outlined, Colors.purple),
          _DashboardCardData('Notifications', '1', Icons.notifications_none, Colors.orange),
        ];
      case 'manager':
        return [
          _DashboardCardData('Revenue', 'Fr 250k', Icons.trending_up, Colors.green),
          _DashboardCardData('Orders Today', '24', Icons.receipt_long, Colors.blue),
          _DashboardCardData('Active Menus', '12', Icons.restaurant_menu, Colors.purple),
          _DashboardCardData('Low Stock', '5', Icons.inventory_2_outlined, Colors.orange),
        ];
      default:
        return [
          _DashboardCardData('Orders', '24', Icons.receipt_long, Colors.blue),
          _DashboardCardData('Menus', '12', Icons.restaurant_menu, Colors.purple),
          _DashboardCardData('Low Stock', '5', Icons.inventory_2_outlined, Colors.orange),
          _DashboardCardData('Users', '3', Icons.people_outline, Colors.green),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final role = _role ?? 'user';
    final cards = _cardsForRole(_role);
    final roleCapitalized = role.isEmpty ? 'User' : role[0].toUpperCase() + role.substring(1);
    final initials = _initialsFromName(_username);

    return Scaffold(
      extendBody: true,
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.black,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF020617), Color(0xFF0F172A), Color(0xFF020817)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          children: [
            // ✅ Custom App Bar with no SafeArea
            _buildCustomAppBar(roleCapitalized, initials),

            // ✅ Body Content
            Expanded(
              child: _isLoading
                  ? const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF34D399),
                ),
              )
                  : _buildBody(roleCapitalized, cards),
            ),
          ],
        ),
      ),
      floatingActionButton: _selectedIndex == 1
          ? ScaleTransition(
        scale: _fabScaleAnimation,
        child: FloatingActionButton.extended(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Row(
                  children: [
                    Icon(Icons.add_circle_outline, color: Colors.white),
                    SizedBox(width: 12),
                    Text('Create order (coming soon)'),
                  ],
                ),
                backgroundColor: const Color(0xFF34D399),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
          },
          backgroundColor: const Color(0xFF34D399),
          icon: const Icon(Icons.add, color: Colors.black),
          label: const Text(
            'New Order',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      )
          : null,
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  // ✅ Custom App Bar without SafeArea
  Widget _buildCustomAppBar(String roleCapitalized, String initials) {
    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 8,
        left: 16,
        right: 16,
        bottom: 16,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF0F172A).withOpacity(0.9),
            const Color(0xFF020617).withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left side - Avatar and User Info
          Row(
            children: [
              // Avatar with gradient border
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF34D399),
                      Colors.blue.shade400,
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF34D399).withOpacity(0.4),
                      blurRadius: 12,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(2),
                child: Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFF020617),
                    shape: BoxShape.circle,
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: _pictureUrl != null && _pictureUrl!.isNotEmpty
                      ? Image.network(
                    _pictureUrl!,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return _buildAvatarInitials(initials, roleCapitalized);
                    },
                  )
                      : _buildAvatarInitials(initials, roleCapitalized),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        _username ?? 'User',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 6),
                      if (_isActive == true)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: const Color(0xFF34D399),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF34D399).withOpacity(0.5),
                                blurRadius: 4,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF34D399).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: const Color(0xFF34D399).withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      roleCapitalized,
                      style: const TextStyle(
                        color: Color(0xFF34D399),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Right side - Logout button
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    backgroundColor: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    title: const Text(
                      'Logout',
                      style: TextStyle(color: Colors.white),
                    ),
                    content: const Text(
                      'Are you sure you want to logout?',
                      style: TextStyle(color: Colors.white70),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text(
                          'Logout',
                          style: TextStyle(color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                );

                if (confirm == true) {
                  await AuthStorage.clear();
                  if (!mounted) return;
                  Navigator.pushNamedAndRemoveUntil(
                    context,
                    '/login',
                        (route) => false,
                  );
                }
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.red.shade400.withOpacity(0.3)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.logout, color: Colors.red.shade400, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      'Logout',
                      style: TextStyle(
                        color: Colors.red.shade400,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarInitials(String initials, String roleCapitalized) {
    return Center(
      child: Text(
        initials.isEmpty ? roleCapitalized[0] : initials,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  // ✅ Bottom Navigation Bar
  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          if (index == 1) {
            _fabController.forward();
          } else {
            _fabController.reverse();
          }
        },
        backgroundColor: Colors.transparent,
        selectedItemColor: const Color(0xFF34D399),
        unselectedItemColor: Colors.white54,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedFontSize: 12,
        unselectedFontSize: 11,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            activeIcon: Icon(Icons.receipt_long),
            label: 'Orders',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu_outlined),
            activeIcon: Icon(Icons.restaurant_menu),
            label: 'Menu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.payments_outlined),
            activeIcon: Icon(Icons.payments),
            label: 'Payments',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildBody(String roleCapitalized, List<_DashboardCardData> cards) {
    switch (_selectedIndex) {
      case 0:
        return _buildDashboard(roleCapitalized, cards);
      case 1:
        return _buildComingSoon('Orders', Icons.receipt_long);
      case 2:
        return _buildComingSoon('Menus', Icons.restaurant_menu);
      case 3:
        return _buildComingSoon('Payments', Icons.payments);
      case 4:
        return ProfileTabContent(
          username: _username,
          email: _email,
          roleLabel: roleCapitalized,
          pictureUrl: _pictureUrl,
          isActive: _isActive,
          createdAt: _createdAt,
          onEdit: () {
            Navigator.pushNamed(context, '/edit-profile').then((_) {
              _loadRole(); // Refresh data after editing
            });
          },
        );
      default:
        return const SizedBox.shrink();
    }
  }

  // ✅ Dashboard Tab
  Widget _buildDashboard(String roleCapitalized, List<_DashboardCardData> cards) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$roleCapitalized Dashboard',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Welcome back! Here\'s your overview.',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.3,
            ),
            itemCount: cards.length,
            itemBuilder: (context, index) {
              return _DashboardCard(
                data: cards[index],
                delay: Duration(milliseconds: index * 100),
              );
            },
          ),
        ],
      ),
    );
  }

  // ✅ Coming Soon Placeholder
  Widget _buildComingSoon(String title, IconData icon) {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 360),
        margin: const EdgeInsets.all(24),
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              const Color(0xFF0F172A).withOpacity(0.8),
              const Color(0xFF1E293B).withOpacity(0.6),
            ],
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF34D399).withOpacity(0.2),
                    Colors.blue.withOpacity(0.2),
                  ],
                ),
              ),
              child: Icon(icon, color: const Color(0xFF34D399), size: 48),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Coming Soon',
              style: TextStyle(
                color: Color(0xFF34D399),
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'This feature is under development',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ✅ Dashboard Card Data Model
class _DashboardCardData {
  const _DashboardCardData(this.title, this.value, this.icon, this.color);

  final String title;
  final String value;
  final IconData icon;
  final Color color;
}

// ✅ Animated Dashboard Card
class _DashboardCard extends StatefulWidget {
  const _DashboardCard({required this.data, this.delay});

  final _DashboardCardData data;
  final Duration? delay;

  @override
  State<_DashboardCard> createState() => _DashboardCardState();
}

class _DashboardCardState extends State<_DashboardCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    Future.delayed(widget.delay ?? Duration.zero, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                const Color(0xFF0F172A),
                const Color(0xFF1E293B).withOpacity(0.8),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: widget.data.color.withOpacity(0.3),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: widget.data.color.withOpacity(0.2),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: widget.data.color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  widget.data.icon,
                  color: widget.data.color,
                  size: 24,
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.data.value,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.data.title,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}