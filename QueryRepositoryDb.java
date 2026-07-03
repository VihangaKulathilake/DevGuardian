import java.sql.*;

public class QueryRepositoryDb {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/devguardian_repository";
        String user = System.getenv("POSTGRES_DB_USERNAME");
        String password = System.getenv("POSTGRES_DB_PASSWORD");

        if (user == null) user = "postgres";
        if (password == null) password = "password";

        System.out.println("Connecting to devguardian_repository database...");
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connection successful!");

            // Query repository 3
            System.out.println("\n--- REPOSITORY DETAILS ---");
            String sql = "SELECT id, user_id, name, clone_url, branch, status, provider FROM repositories WHERE id = 3";
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    System.out.printf("ID: %d | UserID: %d | Name: %s | CloneURL: %s | Branch: %s | Status: %s | Provider: %s%n",
                            rs.getLong("id"),
                            rs.getLong("user_id"),
                            rs.getString("name"),
                            rs.getString("clone_url"),
                            rs.getString("branch"),
                            rs.getString("status"),
                            rs.getString("provider")
                    );
                } else {
                    System.out.println("Repository with ID 3 not found!");
                }
            }

            // Query git connections
            System.out.println("\n--- GITHUB CONNECTIONS ---");
            String connSql = "SELECT id, user_id, username, access_token IS NOT NULL as token_exists FROM github_connections";
            try (PreparedStatement stmt = conn.prepareStatement(connSql);
                 ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    System.out.printf("ID: %d | UserID: %d | Username: %s | TokenExists: %b%n",
                            rs.getLong("id"),
                            rs.getLong("user_id"),
                            rs.getString("username"),
                            rs.getBoolean("token_exists")
                    );
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
