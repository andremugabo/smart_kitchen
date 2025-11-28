package util;

import java.awt.Color;
import java.awt.Container;
import java.awt.GradientPaint;
import java.awt.Graphics;
import java.awt.Graphics2D;

import javax.swing.AbstractButton;
import javax.swing.BorderFactory;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JTable;
import javax.swing.table.JTableHeader;

public class SmartKitchenTheme {

    public static final Color BG_DARKEST = new Color(0, 0, 20);       // #000014 approx
    public static final Color BG_NAVY = new Color(10, 10, 30);        // #0A0A1E
    public static final Color PANEL_BG = new Color(26, 31, 45);       // #1A1F2D
    public static final Color BORDER = new Color(42, 47, 69);         // #2A2F45

    public static final Color TEXT_PRIMARY = Color.WHITE;
    public static final Color TEXT_SECONDARY = new Color(156, 163, 175); // #9CA3AF

    public static final Color ACCENT_GREEN = new Color(0, 230, 118);  // #00E676
    public static final Color ACCENT_YELLOW = new Color(255, 193, 7); // #FFC107

    public static void applyRoot(JFrame frame) {
        if (frame == null) return;
        Container c = frame.getContentPane();
        if (c != null) {
            c.setBackground(BG_DARKEST);
        }
        if (frame.getRootPane() != null) {
            frame.getRootPane().setBorder(BorderFactory.createLineBorder(BORDER));
        }
    }

    public static void stylePrimaryLabel(JLabel label) {
        if (label != null) {
            label.setForeground(TEXT_PRIMARY);
        }
    }

    public static void styleSecondaryLabel(JLabel label) {
        if (label != null) {
            label.setForeground(TEXT_SECONDARY);
        }
    }

    public static void styleCard(JComponent comp) {
        if (comp != null) {
            comp.setOpaque(true);
            comp.setBackground(PANEL_BG);
            comp.setBorder(BorderFactory.createLineBorder(BORDER));
        }
    }

    public static void styleTable(JTable table) {
        if (table == null) return;
        table.setBackground(PANEL_BG);
        table.setForeground(TEXT_PRIMARY);
        table.setGridColor(BORDER);
        JTableHeader header = table.getTableHeader();
        if (header != null) {
            header.setBackground(BG_NAVY);
            header.setForeground(TEXT_SECONDARY);
        }
    }

    public static void styleGradientButton(AbstractButton button) {
        if (button == null) return;
        button.setContentAreaFilled(false);
        button.setOpaque(false);
        button.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(ACCENT_GREEN),
                BorderFactory.createEmptyBorder(6, 16, 6, 16)));
        button.setForeground(TEXT_PRIMARY);
        button.setFocusPainted(false);
    }

    public static void paintAccentGradient(Graphics g, JComponent comp) {
        if (g == null || comp == null) return;
        Graphics2D g2 = (Graphics2D) g.create();
        try {
            int w = comp.getWidth();
            int h = comp.getHeight();
            // Slightly bias toward green by blending green into the end color
            Color end = new Color(
                (ACCENT_GREEN.getRed() + ACCENT_YELLOW.getRed()) / 2,
                (ACCENT_GREEN.getGreen() + ACCENT_YELLOW.getGreen()) / 2,
                (ACCENT_GREEN.getBlue() + ACCENT_YELLOW.getBlue()) / 3
            );
            GradientPaint gp = new GradientPaint(0, 0, ACCENT_GREEN, w, 0, end);
            g2.setPaint(gp);
            g2.fillRoundRect(0, 0, w, h, 14, 14);
        } finally {
            g2.dispose();
        }
    }
}
