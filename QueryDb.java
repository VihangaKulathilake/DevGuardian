import java.sql.*;

public class QueryDb {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/devguardian_analysis";
        String user = System.getenv("POSTGRES_DB_USERNAME");
        String password = System.getenv("POSTGRES_DB_PASSWORD");

        if (user == null) user = "postgres";
        if (password == null) password = "password";

        System.out.println("Connecting to devguardian_analysis database...");
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connection successful!");

            // Query analyses
            System.out.println("\n--- LATEST ANALYSES ---");
            String sql = "SELECT id, repository_id, status, started_at, completed_at, security_score, quality_score, architecture_score FROM analyses ORDER BY id DESC LIMIT 5";
            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    System.out.printf("ID: %d | RepoID: %d | Status: %s | Started: %s | Completed: %s | Security: %d | Quality: %d | Arch: %d%n",
                            rs.getLong("id"),
                            rs.getLong("repository_id"),
                            rs.getString("status"),
                            rs.getTimestamp("started_at"),
                            rs.getTimestamp("completed_at"),
                            rs.getObject("security_score") != null ? rs.getInt("security_score") : -1,
                            rs.getObject("quality_score") != null ? rs.getInt("quality_score") : -1,
                            rs.getObject("architecture_score") != null ? rs.getInt("architecture_score") : -1
                    );
                }
            }

            // Query issues count
            System.out.println("\n--- ISSUES COUNT BY ANALYSIS ---");
            String countSql = "SELECT analysis_id, COUNT(*) as cnt FROM issues GROUP BY analysis_id ORDER BY analysis_id DESC LIMIT 5";
            try (PreparedStatement stmt = conn.prepareStatement(countSql);
                 ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    System.out.printf("Analysis ID: %d | Total Issues: %d%n",
                            rs.getLong("analysis_id"),
                            rs.getLong("cnt")
                    );
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
