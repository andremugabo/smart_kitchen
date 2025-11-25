import 'package:flutter/material.dart';
import 'package:mobile_app/services/report_service.dart';
import 'package:mobile_app/ui/screens/menu/menu_details_screen.dart';

class MenuPerformanceScreen extends StatefulWidget {
  const MenuPerformanceScreen({super.key});

  @override
  State<MenuPerformanceScreen> createState() => _MenuPerformanceScreenState();
}

enum _MenuRange { today, week, month, all }
enum _MenuSort { revenue, quantity, orders }

class _MenuPerformanceScreenState extends State<MenuPerformanceScreen> {
  final ReportService _reportService = ReportService();
  late Future<List<Map<String, dynamic>>> _futureItems;
  _MenuRange _range = _MenuRange.week;
  _MenuSort _sort = _MenuSort.revenue;

  @override
  void initState() {
    super.initState();
    _futureItems = _loadData();
  }

  Future<List<Map<String, dynamic>>> _loadData() async {
    DateTime? from;
    DateTime? to;
    final now = DateTime.now();

    switch (_range) {
      case _MenuRange.today:
        from = DateTime(now.year, now.month, now.day);
        to = DateTime(now.year, now.month, now.day, 23, 59, 59);
        break;
      case _MenuRange.week:
        from = now.subtract(const Duration(days: 6));
        to = now;
        break;
      case _MenuRange.month:
        from = DateTime(now.year, now.month, 1);
        to = now;
        break;
      case _MenuRange.all:
        from = null;
        to = null;
        break;
    }

    final data = await _reportService.getMenuPerformance(from: from, to: to);
    final items = data['items'];
    if (items is List) {
      return items
          .whereType<Map<String, dynamic>>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }
    return const [];
  }

  void _changeRange(_MenuRange range) {
    setState(() {
      _range = range;
      _futureItems = _loadData();
    });
  }

  void _changeSort(_MenuSort sort) {
    setState(() {
      _sort = sort;
    });
  }

  List<Map<String, dynamic>> _applySort(List<Map<String, dynamic>> items) {
    final sorted = List<Map<String, dynamic>>.from(items);

    int numCompare(num a, num b) => b.compareTo(a); // descending

    switch (_sort) {
      case _MenuSort.revenue:
        sorted.sort((a, b) => numCompare(
              (a['revenue'] as num?) ?? 0,
              (b['revenue'] as num?) ?? 0,
            ));
        break;
      case _MenuSort.quantity:
        sorted.sort((a, b) => numCompare(
              (a['quantitySold'] as num?) ?? 0,
              (b['quantitySold'] as num?) ?? 0,
            ));
        break;
      case _MenuSort.orders:
        sorted.sort((a, b) => numCompare(
              (a['ordersCount'] as num?) ?? 0,
              (b['ordersCount'] as num?) ?? 0,
            ));
        break;
    }

    return sorted;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 48,
        title: const Text(
          'Menu performance',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Column(
        children: [
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.analytics_outlined,
                      size: 14,
                      color: Color(0xFF34D399),
                    ),
                    const SizedBox(width: 6),
                    const Text(
                      'Top selling menu items',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildRangeChip('Today', _MenuRange.today),
                _buildRangeChip('7 days', _MenuRange.week),
                _buildRangeChip('30 days', _MenuRange.month),
                _buildRangeChip('All', _MenuRange.all),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildSortChip('Revenue', _MenuSort.revenue),
                _buildSortChip('Quantity', _MenuSort.quantity),
                _buildSortChip('Orders', _MenuSort.orders),
              ],
            ),
          ),
            const SizedBox(height: 12),
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _futureItems,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF34D399)),
                    ),
                  );
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Text(
                        'Failed to load performance: ${snapshot.error}',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                }

                var items = snapshot.data ?? const [];
                if (items.isEmpty) {
                  return const Center(
                    child: Text(
                      'No data for this range',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                      ),
                    ),
                  );
                }

                items = _applySort(items);

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final item = items[index];
                    final name = item['name']?.toString() ?? 'Menu item';
                    final quantity = (item['quantitySold'] as num?)?.toInt() ?? 0;
                    final ordersCount = (item['ordersCount'] as num?)?.toInt() ?? 0;
                    final revenue = (item['revenue'] as num?)?.toDouble() ?? 0.0;
                    final series = (item['series'] as List?)
                        ?.whereType<Map<String, dynamic>>()
                        .toList();

                    return InkWell(
                      onTap: () {
                        _showItemDetails(item, index + 1);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.06),
                          ),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 18,
                              backgroundColor: Colors.white.withOpacity(0.06),
                              child: Text(
                                '${index + 1}',
                                style: const TextStyle(
                                  color: Color(0xFF34D399),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    name,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '$ordersCount orders · $quantity items',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.7),
                                      fontSize: 12,
                                    ),
                                  ),
                                  if (series != null && series.isNotEmpty) ...[
                                    const SizedBox(height: 6),
                                    _MiniSparkline(series: series),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'Fr ${revenue.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    color: Color(0xFF34D399),
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRangeChip(String label, _MenuRange range) {
    final selected = _range == range;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => _changeRange(range),
        labelStyle: TextStyle(
          color: selected ? Colors.black : Colors.white,
          fontSize: 12,
        ),
        selectedColor: const Color(0xFF34D399),
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  Widget _buildSortChip(String label, _MenuSort sort) {
    final selected = _sort == sort;
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => _changeSort(sort),
        labelStyle: TextStyle(
          color: selected ? Colors.black : Colors.white,
          fontSize: 12,
        ),
        selectedColor: const Color(0xFF34D399),
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  void _showItemDetails(Map<String, dynamic> item, int rank) {
    final name = item['name']?.toString() ?? 'Menu item';
    final quantity = (item['quantitySold'] as num?)?.toInt() ?? 0;
    final ordersCount = (item['ordersCount'] as num?)?.toInt() ?? 0;
    final revenue = (item['revenue'] as num?)?.toDouble() ?? 0.0;
    final menuId = item['menuId']?.toString();

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: const Color(0xFF020617),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Menu item details',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 18),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: Colors.white.withOpacity(0.06),
                    child: Text(
                      '$rank',
                      style: const TextStyle(
                        color: Color(0xFF34D399),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildStatTile(
                      label: 'Revenue',
                      value: 'Fr ${revenue.toStringAsFixed(0)}',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatTile(
                      label: 'Orders',
                      value: '$ordersCount',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildStatTile(
                      label: 'Items sold',
                      value: '$quantity',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildStatTile(
                      label: 'Avg revenue / item',
                      value: quantity > 0
                          ? 'Fr ${(revenue / quantity).toStringAsFixed(1)}'
                          : 'Fr 0',
                    ),
                  ),
                ],
              ),
              if (menuId != null && menuId.isNotEmpty) ...[
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF34D399),
                      side: const BorderSide(color: Color(0xFF34D399)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => MenuDetailsScreen(
                            menuId: menuId,
                            tableNumber: 0,
                            browseOnly: true,
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.open_in_new_rounded, size: 18),
                    label: const Text(
                      'Open menu details',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatTile({required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniSparkline extends StatelessWidget {
  const _MiniSparkline({required this.series});

  final List<Map<String, dynamic>> series;

  @override
  Widget build(BuildContext context) {
    if (series.isEmpty) return const SizedBox.shrink();

    // Use up to the last 10 points for readability.
    final points = series.length > 10
        ? series.sublist(series.length - 10)
        : series;

    final quantities = points
        .map((e) => (e['quantitySold'] as num?)?.toDouble() ?? 0.0)
        .toList();
    final maxQ = quantities.fold<double>(0, (p, c) => c > p ? c : p);
    if (maxQ <= 0) return const SizedBox.shrink();

    return SizedBox(
      height: 16,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (var i = 0; i < quantities.length; i++) ...[
            Expanded(
              child: Container(
                height: 4 + (12 * (quantities[i] / maxQ)),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(999),
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: const [
                      Color(0xFF34D399),
                      Color(0xFF22C55E),
                    ],
                  ),
                ),
              ),
            ),
            if (i != quantities.length - 1) const SizedBox(width: 2),
          ],
        ],
      ),
    );
  }
}
