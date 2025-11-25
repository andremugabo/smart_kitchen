package views;

import java.awt.BorderLayout;
import java.util.ArrayList;
import java.util.List;
import javax.swing.BorderFactory;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;

import model.User;
import service.MenuService;
import util.SmartKitchenTheme;

public class MenuView extends JFrame {

    private final User currentUser;
    private JComboBox<String> cbCategory;
    private JTable table;
    private DefaultTableModel tableModel;

    private List<MenuService.MenuRow> allMenus = new ArrayList<>();
    private List<MenuService.CategoryRow> categories = new ArrayList<>();

    public MenuView(User user) {
        this.currentUser = user;
        initComponents();
        loadData();
    }

    private void initComponents() {
        setTitle("Smart Kitchen - Menus");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(800, 500);
        setLocationRelativeTo(null);

        JPanel top = new JPanel();
        top.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        top.add(new JLabel("Category:"));
        cbCategory = new JComboBox<>();
        cbCategory.addItem("All categories");
        cbCategory.addActionListener(e -> applyFilter());
        top.add(cbCategory);

        tableModel = new DefaultTableModel(
            new Object[][]{},
            new String[]{
                "Name", "Price", "Estimated cost", "Profit", "Margin %", "Category", "Active", "Kitchen"
            }
        ) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        table = new JTable(tableModel);
        JScrollPane scroll = new JScrollPane(table);

        getContentPane().setLayout(new BorderLayout());
        getContentPane().add(top, BorderLayout.NORTH);
        getContentPane().add(scroll, BorderLayout.CENTER);

        pack();
        setExtendedState(java.awt.Frame.MAXIMIZED_BOTH);
        setLocationRelativeTo(null);
    }

    private void loadData() {
        if (currentUser == null || currentUser.getToken() == null) {
            return;
        }
        try {
            MenuService service = new MenuService();
            allMenus = service.listMenus(currentUser.getToken());
            categories = service.listCategories(currentUser.getToken());

            cbCategory.removeAllItems();
            cbCategory.addItem("All categories");
            for (MenuService.CategoryRow c : categories) {
                cbCategory.addItem(c.name);
            }

            applyFilter();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private void applyFilter() {
        String selectedName = (String) cbCategory.getSelectedItem();
        String selectedCategoryId = null;
        if (selectedName != null && !"All categories".equals(selectedName)) {
            for (MenuService.CategoryRow c : categories) {
                if (selectedName.equals(c.name)) {
                    selectedCategoryId = c.id;
                    break;
                }
            }
        }

        tableModel.setRowCount(0);
        for (MenuService.MenuRow m : allMenus) {
            if (selectedCategoryId != null) {
                if (m.categoryId == null || !selectedCategoryId.equals(m.categoryId)) {
                    continue;
                }
            }
            double price = m.price;
            Double cost = m.estimatedCost;
            Double profit = (cost != null) ? (price - cost) : null;
            Double margin = (cost != null && price > 0) ? (profit / price) : null;

            String categoryName = "-";
            for (MenuService.CategoryRow c : categories) {
                if (c.id != null && c.id.equals(m.categoryId)) {
                    categoryName = c.name;
                    break;
                }
            }

            tableModel.addRow(new Object[]{
                m.name,
                String.format("%.2f", price),
                cost != null ? String.format("%.2f", cost) : "-",
                profit != null ? String.format("%.2f", profit) : "-",
                margin != null ? String.format("%.1f", margin * 100) : "-",
                categoryName,
                m.active ? "Active" : "Inactive",
                m.kitchenItem ? "Yes" : "No"
            });
        }
    }
}
