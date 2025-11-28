package views;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;

import util.SmartKitchenTheme;

public class CashierBillsView extends JFrame {

    public CashierBillsView() {
        initComponents();
    }

    private void initComponents() {
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setTitle("Smart Kitchen - Bills");

        JLabel lbl = new JLabel("Bills - TODO", SwingConstants.CENTER);
        lbl.setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 18));

        JPanel root = new JPanel();
        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(root);
        root.setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addContainerGap()
                .addComponent(lbl, javax.swing.GroupLayout.DEFAULT_SIZE, 580, Short.MAX_VALUE)
                .addContainerGap())
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(layout.createSequentialGroup()
                .addContainerGap(40, Short.MAX_VALUE)
                .addComponent(lbl)
                .addContainerGap(40, Short.MAX_VALUE))
        );

        setContentPane(root);
        pack();
        setExtendedState(java.awt.Frame.MAXIMIZED_BOTH);
        setLocationRelativeTo(null);
        SmartKitchenTheme.applyRoot(this);
        SmartKitchenTheme.styleCard(root);
        SmartKitchenTheme.stylePrimaryLabel(lbl);
    }
}
