package service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import util.ApiConfig;

public class OrderService {

    public static class WaiterOrderStats {
        public int tablesAssigned;
        public int openOrdersCount;
    }

    public static class WaiterOpenOrderRow {
        public String id;
        public String tableNumber;
        public String status;
        public double totalAmount;
        public String orderDate;
    }

    public static class WaiterOrdersResponse {
        public WaiterOrderStats stats;
        public List<WaiterOpenOrderRow> openOrders;
    }

    public WaiterOrdersResponse getCurrentWaiterOrders(String token) throws Exception {
        String json = getWithAuth(ApiConfig.BASE_URL + "/orders/waiter/current", token);
        WaiterOrdersResponse resp = new WaiterOrdersResponse();
        resp.stats = new WaiterOrderStats();
        resp.stats.tablesAssigned = (int) parseNumberField(json, "tablesAssigned");
        resp.stats.openOrdersCount = (int) parseNumberField(json, "openOrdersCount");
        resp.openOrders = parseOpenOrders(json);
        return resp;
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
        String key = "\"" + fieldName + "\"";
        int idx = json.indexOf(key);
        if (idx < 0) return 0.0;
        int colon = json.indexOf(":", idx);
        if (colon < 0) return 0.0;
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

    private List<WaiterOpenOrderRow> parseOpenOrders(String json) {
        List<WaiterOpenOrderRow> list = new ArrayList<>();
        String key = "\"openOrders\"";
        int arrStart = json.indexOf(key);
        if (arrStart < 0) return list;
        arrStart = json.indexOf('[', arrStart);
        if (arrStart < 0) return list;
        int arrEnd = json.indexOf(']', arrStart);
        if (arrEnd < 0) return list;
        String inner = json.substring(arrStart + 1, arrEnd);
        int idx = 0;
        while (true) {
            int start = inner.indexOf('{', idx);
            if (start < 0) break;
            int end = findMatchingBrace(inner, start);
            if (end < 0) break;
            String obj = inner.substring(start, end + 1);
            WaiterOpenOrderRow row = new WaiterOpenOrderRow();
            row.id = extractStringField(obj, "id");
            row.tableNumber = extractStringField(obj, "tableNumber");
            row.status = extractStringField(obj, "status");
            row.orderDate = extractStringField(obj, "orderDate");
            row.totalAmount = parseNumberField(obj, "totalAmount");
            list.add(row);
            idx = end + 1;
        }
        return list;
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
