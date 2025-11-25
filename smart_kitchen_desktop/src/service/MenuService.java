/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import util.ApiConfig;

/**
 *
 * @author ntgr
 */
public class MenuService {
    public static class MenuRow {
        public String id;
        public String name;
        public double price;
        public Double estimatedCost;
        public String categoryId;
        public boolean active;
        public boolean kitchenItem;
    }

    public static class CategoryRow {
        public String id;
        public String name;
    }

    public List<MenuRow> listMenus(String token) throws Exception {
        String json = getWithAuth(ApiConfig.BASE_URL + "/menus", token);
        List<MenuRow> items = new ArrayList<>();
        int arrStart = json.indexOf('[');
        int arrEnd = json.lastIndexOf(']');
        if (arrStart < 0 || arrEnd <= arrStart) return items;
        String inner = json.substring(arrStart + 1, arrEnd);
        int idx = 0;
        while (true) {
            int start = inner.indexOf('{', idx);
            if (start < 0) break;
            int end = findMatchingBrace(inner, start);
            if (end < 0) break;
            String obj = inner.substring(start, end + 1);
            MenuRow row = new MenuRow();
            row.id = extractStringField(obj, "id");
            row.name = extractStringField(obj, "name");
            row.price = parseNumberField(obj, "price");
            double cost = parseNumberField(obj, "estimated_cost");
            row.estimatedCost = cost > 0 ? cost : null;
            row.categoryId = extractStringField(obj, "category_id");
            row.active = parseBooleanField(obj, "is_active");
            row.kitchenItem = parseBooleanField(obj, "is_kitchen_item");
            if (row.id != null) {
                items.add(row);
            }
            idx = end + 1;
        }
        return items;
    }

    public List<CategoryRow> listCategories(String token) throws Exception {
        String json = getWithAuth(ApiConfig.BASE_URL + "/menu-categories", token);
        List<CategoryRow> items = new ArrayList<>();
        int arrStart = json.indexOf('[');
        int arrEnd = json.lastIndexOf(']');
        if (arrStart < 0 || arrEnd <= arrStart) return items;
        String inner = json.substring(arrStart + 1, arrEnd);
        int idx = 0;
        while (true) {
            int start = inner.indexOf('{', idx);
            if (start < 0) break;
            int end = findMatchingBrace(inner, start);
            if (end < 0) break;
            String obj = inner.substring(start, end + 1);
            CategoryRow row = new CategoryRow();
            row.id = extractStringField(obj, "id");
            row.name = extractStringField(obj, "name");
            if (row.id != null) {
                items.add(row);
            }
            idx = end + 1;
        }
        return items;
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

    private boolean parseBooleanField(String json, String fieldName) {
        String key = "\"" + fieldName + "\"";
        int idx = json.indexOf(key);
        if (idx < 0) return false;
        int colon = json.indexOf(":", idx);
        if (colon < 0) return false;
        int start = colon + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) {
            start++;
        }
        if (json.startsWith("true", start)) return true;
        if (json.startsWith("false", start)) return false;
        return false;
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
