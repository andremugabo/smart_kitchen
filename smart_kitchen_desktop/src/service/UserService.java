/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import model.User;
import util.ApiConfig;

/**
 *
 * @author ntgr
 */
public class UserService {
    public User login(String emailOrUsername, String password) throws Exception {
        URL url = new URL(ApiConfig.LOGIN_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        conn.setDoOutput(true);

        String jsonBody = "{\"emailOrUsername\":\"" + escapeJson(emailOrUsername) + "\",\"password\":\"" + escapeJson(password) + "\"}";
        byte[] bodyBytes = jsonBody.getBytes(StandardCharsets.UTF_8);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(bodyBytes);
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

        if (status < 200 || status >= 300 || !response.contains("\"success\":true")) {
            String message = extractStringField(response, "error");
            if (message == null || message.isEmpty()) {
                message = "Login failed with status " + status;
            }
            throw new Exception(message);
        }

        String token = extractStringField(response, "token");
        String id = extractStringField(response, "id");
        String username = extractStringField(response, "username");
        String email = extractStringField(response, "email");
        String role = extractStringField(response, "role");

        return new User(id, username, email, role, token);
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String extractStringField(String json, String fieldName) {
        String patternString = "\\\"" + Pattern.quote(fieldName) + "\\\"\\s*:\\s*\\\"(.*?)\\\"";
        Pattern pattern = Pattern.compile(patternString);
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
