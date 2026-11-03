package com.kiandelamarre.dashboard.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseInitialiser {

    @Bean
    public CommandLineRunner initialiseDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // 0. Disable foreign keys during initial structural changes
                jdbcTemplate.execute("PRAGMA foreign_keys = OFF;");

                // 1. Ensure the 'cols' table exists
                jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS "cols" (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT
                    );
                """);

                // 2. Ensure default columns (1, 2, 3, 4) exist FIRST
                String[] defaultCols = {"Media", "Services", "Links", "Admin"};
                for (int i = 0; i < defaultCols.length; i++) {
                    int colId = i + 1;
                    Integer exists = jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM cols WHERE id = ?;", Integer.class, colId
                    );
                    if (exists != null && exists == 0) {
                        jdbcTemplate.update("INSERT INTO cols (id, name) VALUES (?, ?);", colId, defaultCols[i]);
                    }
                }

                // 3. Scan the existing 'links' table for ANY higher column IDs used and auto-create them in 'cols'
                boolean linksExists = Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='links';",
                        Boolean.class
                ));

                if (linksExists) {
                    jdbcTemplate.query(
                            "SELECT DISTINCT \"column\" FROM links WHERE \"column\" IS NOT NULL;",
                            rs -> {
                                int colId = rs.getInt("column");
                                Integer count = jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM cols WHERE id = ?;", Integer.class, colId
                                );
                                if (count != null && count == 0) {
                                    jdbcTemplate.update("INSERT INTO cols (id, name) VALUES (?, ?);", colId, "Column " + colId);
                                }
                            }
                    );
                }

                // 4. Perform legacy column migration (localip/remoteip -> localurl/remoteurl)
                if (!linksExists) {
                    jdbcTemplate.execute("""
                        CREATE TABLE "links" (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            localurl TEXT,
                            remoteurl TEXT,
                            imgurl TEXT,
                            name TEXT,
                            "row" INTEGER DEFAULT 0,
                            "column" INTEGER,
                            FOREIGN KEY("column") REFERENCES cols(id) ON DELETE CASCADE
                        );
                    """);
                } else {
                    boolean hasOldColumns = Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM pragma_table_info('links') WHERE name = 'localip';",
                            Boolean.class
                    ));

                    if (hasOldColumns) {
                        jdbcTemplate.execute("""
                            CREATE TABLE "links_new" (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                localurl TEXT,
                                remoteurl TEXT,
                                imgurl TEXT,
                                name TEXT,
                                "row" INTEGER DEFAULT 0,
                                "column" INTEGER,
                                FOREIGN KEY("column") REFERENCES cols(id) ON DELETE CASCADE
                            );
                        """);

                        // Copy exact existing column integers over
                        jdbcTemplate.execute("""
                            INSERT INTO "links_new" (id, localurl, remoteurl, imgurl, name, "column", "row")
                            SELECT id, localip, remoteip, imgurl, name, "column", row FROM "links";
                        """);

                        jdbcTemplate.execute("DROP TABLE \"links\";");
                        jdbcTemplate.execute("ALTER TABLE \"links_new\" RENAME TO \"links\";");
                    }
                }

                // 5. NOW run the safety update ONLY for true orphans or NULLs (since cols 1-4+ are guaranteed to exist)
                jdbcTemplate.execute("UPDATE links SET \"column\" = 1 WHERE \"column\" NOT IN (SELECT id FROM cols) OR \"column\" IS NULL;");

                // 6. Re-enable foreign keys
                jdbcTemplate.execute("PRAGMA foreign_keys = ON;");

                System.out.println("Database migration completed preserving original column layout!");
            } catch (Exception e) {
                System.err.println("Migration error: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}