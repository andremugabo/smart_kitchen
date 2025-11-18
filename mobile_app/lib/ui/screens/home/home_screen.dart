import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:mobile_app/services/auth_storage.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? _role;
  String? _username;
  String? _pictureUrl;
  String? _email;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadRole();
  }

  Future<void> _loadRole() async {
    final token = await AuthStorage.getToken();
    String? derivedRole;

    if (token != null && token.isNotEmpty) {
      try {
        final decoded = JwtDecoder.decode(token);
        derivedRole = decoded['role']?.toString();
      } catch (_) {
        // ignore malformed token, fall back to stored role
      }
    }

    final storedRole = await AuthStorage.getRole();
    final username = await AuthStorage.getUsername();
    final picture = await AuthStorage.getPicture();
    final email = await AuthStorage.getEmail();

    if (!mounted) return;
    setState(() {
      _role = derivedRole ?? storedRole;
      _username = username;
      _pictureUrl = picture;
      _email = email;
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
          _DashboardCardData('Users', '12', Icons.people_outline),
          _DashboardCardData('Menus', '8', Icons.restaurant_menu),
          _DashboardCardData('Inventory items', '42', Icons.inventory_2_outlined),
          _DashboardCardData('Purchase records', '17', Icons.receipt_long),
        ];
      case 'chef':
        return [
          _DashboardCardData('Orders in kitchen', '9', Icons.local_dining),
          _DashboardCardData('Pending dishes', '5', Icons.timer_outlined),
          _DashboardCardData('Recipes', '23', Icons.menu_book_outlined),
          _DashboardCardData('Low stock items', '3', Icons.warning_amber_outlined),
        ];
      case 'waiter':
        return [
          _DashboardCardData('Open tables', '4', Icons.table_restaurant),
          _DashboardCardData('Active orders', '7', Icons.receipt_long),
          _DashboardCardData('Bills to pay', '2', Icons.payments_outlined),
          _DashboardCardData('Notifications', '1', Icons.notifications_none),
        ];
      case 'manager':
        return [
          _DashboardCardData('Today revenue', 'Fr 250k', Icons.trending_up),
          _DashboardCardData('Orders today', '24', Icons.receipt_long),
          _DashboardCardData('Active menus', '12', Icons.restaurant_menu),
          _DashboardCardData('Low stock items', '5', Icons.inventory_2_outlined),
        ];
      default:
        return [
          _DashboardCardData('Orders today', '24', Icons.receipt_long),
          _DashboardCardData('Active menus', '12', Icons.restaurant_menu),
          _DashboardCardData('Low stock items', '5', Icons.inventory_2_outlined),
          _DashboardCardData('Users online', '3', Icons.people_outline),
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
      appBar: AppBar(
        title: const Text('Smart Kitchen'),
        backgroundColor: Colors.black,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF020617), Color(0xFF0F172A), Colors.black],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: const Color(0xFF020617),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(color: const Color(0xFF1E293B)),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: _pictureUrl != null && _pictureUrl!.isNotEmpty
                              ? Image.network(
                            _pictureUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Text(
                                  initials.isEmpty
                                      ? roleCapitalized[0]
                                      : initials,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              );
                            },
                          )
                              : Center(
                            child: Text(
                              initials.isEmpty
                                  ? roleCapitalized[0]
                                  : initials,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (_username != null && _username!.isNotEmpty)
                              Text(
                                _username!,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            Text(
                              roleCapitalized,
                              style: const TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    TextButton(
                      onPressed: () async {
                        await AuthStorage.clear();
                        if (!mounted) return;
                        Navigator.pushNamedAndRemoveUntil(
                          context,
                          '/login',
                              (route) => false,
                        );
                      },
                      child: const Text(
                        'Logout',
                        style: TextStyle(
                          color: Color(0xFF34D399),
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildBody(roleCapitalized, cards),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: _selectedIndex == 1
          ? FloatingActionButton(
              backgroundColor: const Color(0xFF34D399),
              onPressed: () {
                // TODO: Navigate to a Create Order screen when implemented.
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Create order action (to be implemented).'),
                  ),
                );
              },
              child: const Icon(
                Icons.add,
                color: Colors.black,
              ),
            )
          : null,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
        },
        backgroundColor: Colors.black,
        selectedItemColor: const Color(0xFF34D399),
        unselectedItemColor: Colors.white54,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            label: 'Orders',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu),
            label: 'Menu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.payments_outlined),
            label: 'Payments',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildBody(String roleCapitalized, List<_DashboardCardData> cards) {
    switch (_selectedIndex) {
      case 0:
        return Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$roleCapitalized dashboard',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Quick overview of your Smart Kitchen.',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: GridView.builder(
                  gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.3,
                  ),
                  itemCount: cards.length,
                  itemBuilder: (context, index) {
                    final card = cards[index];
                    return _DashboardCard(data: card);
                  },
                ),
              ),
            ],
          ),
        );
      case 1:
        return Expanded(
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 360),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF020617),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Orders',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Mobile orders UI coming soon.',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      case 2:
        return Expanded(
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 360),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF020617),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Menus',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Mobile menus UI coming soon.',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      case 3:
        return Expanded(
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 360),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF020617),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: const Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Payments',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Mobile payments UI coming soon.',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      case 4:
        return Expanded(
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 360),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF020617),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: const Color(0xFF020617),
                          borderRadius: BorderRadius.circular(999),
                          border:
                          Border.all(color: const Color(0xFF1E293B)),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: _pictureUrl != null &&
                            _pictureUrl!.isNotEmpty
                            ? Image.network(
                          _pictureUrl!,
                          fit: BoxFit.cover,
                        )
                            : Center(
                          child: Text(
                            _initialsFromName(_username).isEmpty
                                ? roleCapitalized[0]
                                : _initialsFromName(_username),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _username ?? 'User',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              roleCapitalized,
                              style: const TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 12,
                              ),
                            ),
                            if (_email != null && _email!.isNotEmpty)
                              Text(
                                _email!,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Profile overview',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

class _DashboardCardData {
  const _DashboardCardData(this.title, this.value, this.icon);

  final String title;
  final String value;
  final IconData icon;
}

class _DashboardCard extends StatelessWidget {
  const _DashboardCard({required this.data});

  final _DashboardCardData data;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF020617),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(data.icon, color: Colors.tealAccent, size: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                data.value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                data.title,
                style: const TextStyle(color: Colors.white70, fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }
}