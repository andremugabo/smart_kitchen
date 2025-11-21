import 'package:meta/meta.dart';

@immutable
class Menu {
  const Menu({
    required this.id,
    required this.name,
    this.description,
    this.picture,
    required this.price,
    this.estimatedCost,
    this.isActive = true,
    this.isKitchenItem = false,
    required this.categoryId,
  });

  final String id;
  final String name;
  final String? description;
  final String? picture;
  final double price;
  final double? estimatedCost;
  final bool isActive;
  final bool isKitchenItem;
  final String categoryId;

  factory Menu.fromJson(Map<String, dynamic> json) {
    double? parseDouble(dynamic v) {
      if (v == null) return null;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString());
    }

    return Menu(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description'] as String?,
      picture: json['picture'] as String?,
      price: parseDouble(json['price']) ?? 0.0,
      estimatedCost: parseDouble(json['estimated_cost']),
      isActive: (json['is_active'] as bool?) ?? true,
      isKitchenItem: (json['is_kitchen_item'] as bool?) ?? false,
      categoryId: json['category_id']?.toString() ?? '',
    );
  }
}
