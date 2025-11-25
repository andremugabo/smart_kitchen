package service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import util.ApiConfig;

public class ReportService {

    public static class SalesSummary {
        public double totalRevenue;
        public int totalOrders;
    }

    public static class PurchaseSummary {
        public double totalSpend;
        public int totalPurchases;
    }

    public static class SalesOverTimeOverview {
        public int daysWithSales;
    }

    public static class WaiterPerformanceOverview {
        public int waiterCount;
    }

    public static class ChefPerformanceOverview {
        public int chefCount;
    }

    public static class WaiterPerformanceRow {
        public String name;
        public int totalOrdersServed;
        public double totalRevenue;
        public double averageOrderValue;
        public String peakHour;
    }

    public static class ChefPerformanceRow {
        public String name;
        public int dishesPrepared;
        public Double averagePreparationTimeMinutes;
    }

    public SalesSummary getSalesSummary(String token) throws Exception {
        String json = getWithAuth(ApiConfig.BASE_URL + "/reports/sales-summary", token);
        SalesSummary s = new SalesSummary();
        s.totalRevenue = parseNumberField(json, "totalRevenue");
        s.totalOrders = (int) parseNumberField(json, "totalOrders");
        return s;
    }

    public PurchaseSummary getPurchaseSummary(String token) throws Exception {
        String json = getWithAuth(ApiConfig.BASE_URL + "/reports/purchase-summary", token);
        PurchaseSummary p = new PurchaseSummary();
        p.totalSpend = parseNumberField(json, "totalSpend");
        p.totalPurchases = (int) parseNumberField(json, "totalPurchases");
        return p;
    }

    public SalesOverTimeOverview getSalesOverTimeOverview(String token) throws Exception {
        String json = getWithAuth(ApiConfig.BASE_URL + "/reports/sales-over-time", token);
        SalesOverTimeOverview o = new SalesOverTimeOverview();
        o.daysWithSales = countObjectsInArray(json);
        return o;
    }

    public WaiterPerformanceOverview getWaiterPerformanceOverview(String token) throws Exception {
        String json = getWithAuth(ApiConfig.BASE_URL + "/reports/waiter-performance", token);
        WaiterPerformanceOverview o = new WaiterPerformanceOverview();
        o.waiterCount = countObjectsInArray(json);
        return o;
    }

    public ChefPerformanceOverview getChefPerformanceOverview(String token) throws Exception {
        String json = getWithAuth(ApiConfig.BASE_URL + "/reports/chef-performance", token);
        ChefPerformanceOverview o = new ChefPerformanceOverview();
        o.chefCount = countObjectsInArray(json);
        return o;
    }

    public String getWaiterPerformanceRawJson(String token) throws Exception {
        return getWithAuth(ApiConfig.BASE_URL + "/reports/waiter-performance", token);
    }

    public String getChefPerformanceRawJson(String token) throws Exception {
        return getWithAuth(ApiConfig.BASE_URL + "/reports/chef-performance", token);
    }

    public List<WaiterPerformanceRow> parseWaiterPerformance(String json) {
        List<WaiterPerformanceRow> rows = new ArrayList<>();
        int idx = 0;
        while (true) {
            int start = json.indexOf('{', idx);
            if (start < 0) break;
            int end = findMatchingBrace(json, start);
            if (end < 0) break;
            String obj = json.substring(start, end + 1);
            WaiterPerformanceRow row = new WaiterPerformanceRow();
            row.name = extractStringField(obj, "waiterName");
            row.totalOrdersServed = (int) parseNumberField(obj, "totalOrdersServed");
            row.totalRevenue = parseNumberField(obj, "totalRevenue");
            row.averageOrderValue = parseNumberField(obj, "averageOrderValue");
            row.peakHour = extractStringField(obj, "peakHour");
            if (row.name != null && !row.name.isEmpty()) {
                rows.add(row);
            }
            idx = end + 1;
        }
        return rows;
    }

    public List<ChefPerformanceRow> parseChefPerformance(String json) {
        List<ChefPerformanceRow> rows = new ArrayList<>();
        int idx = 0;
        while (true) {
            int start = json.indexOf('{', idx);
            if (start < 0) break;
            int end = findMatchingBrace(json, start);
            if (end < 0) break;
            String obj = json.substring(start, end + 1);
            ChefPerformanceRow row = new ChefPerformanceRow();
            row.name = extractStringField(obj, "chefName");
            row.dishesPrepared = (int) parseNumberField(obj, "dishesPrepared");
            double avg = parseNumberField(obj, "averagePreparationTimeMinutes");
            row.averagePreparationTimeMinutes = avg > 0 ? avg : null;
            if (row.name != null && !row.name.isEmpty()) {
                rows.add(row);
            }
            idx = end + 1;
        }
        return rows;
    }

    private String getWithAuth(String urlString, String token) throws Exception {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Accept", "application/json");
        if (token != null && !token.isEmpty()) {
            conn.setRequestProperty("Authorization", "Bearer " + token);
        }

        int status = conn.getResponseCode();
        BufferedReader reader;
        if (status >= 200 && status < 300) {
            reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
        } else {
            reader = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        reader.close();
        String response = sb.toString();

        if (status < 200 || status >= 300) {
            throw new Exception("Request failed with status " + status + ": " + response);
        }

        return response;
    }

    private double parseNumberField(String json, String fieldName) {
        String[] keys = new String[]{"\"" + fieldName + "\"", "\"data\""};
        int idx = json.indexOf(keys[0]);
        if (idx < 0) {
            int dataIdx = json.indexOf(keys[1]);
            if (dataIdx >= 0) {
                idx = json.indexOf(keys[0], dataIdx);
            }
        }
        if (idx < 0) {
            return 0.0;
        }
        int colon = json.indexOf(":", idx);
        if (colon < 0) {
            return 0.0;
        }
        int start = colon + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) {
            start++;
        }
        int end = start;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '.' )) {
            end++;
        }
        try {
            return Double.parseDouble(json.substring(start, end));
        } catch (Exception e) {
            return 0.0;
        }
    }

    private int countObjectsInArray(String json) {
        int startArray = json.indexOf('[');
        int endArray = json.lastIndexOf(']');
        if (startArray < 0 || endArray <= startArray) {
            return 0;
        }
        String inner = json.substring(startArray + 1, endArray);
        int count = 0;
        for (int i = 0; i < inner.length(); i++) {
            if (inner.charAt(i) == '{') {
                count++;
            }
        }
        return count;
    }

    private int findMatchingBrace(String json, int start) {
        int depth = 0;
        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '{') depth++;
            else if (c == '}') {
                depth--;
                if (depth == 0) return i;
            }
        }
        return -1;
    }

    private String extractStringField(String json, String fieldName) {
        String key = "\"" + fieldName + "\"";
        int idx = json.indexOf(key);
        if (idx < 0) return null;
        int colon = json.indexOf(":", idx);
        if (colon < 0) return null;
        int start = json.indexOf('"', colon + 1);
        if (start < 0) return null;
        int end = json.indexOf('"', start + 1);
        if (end < 0) return null;
        return json.substring(start + 1, end);
    }
}
