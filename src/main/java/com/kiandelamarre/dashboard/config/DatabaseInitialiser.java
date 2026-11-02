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
            // 0. CRITICAL: Enable foreign key support in SQLite (disabled by default)
            jdbcTemplate.execute("PRAGMA foreign_keys = ON;");

            // 1. Create the 'cols' table
            String createColsSql = """
                CREATE TABLE IF NOT EXISTS "cols" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT
                );
            """;

            // 2. Create the 'links' table with ON DELETE CASCADE added
            String createLinksSql = """
                CREATE TABLE IF NOT EXISTS "links" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    localurl TEXT,
                    remoteurl TEXT,
                    imgurl TEXT,
                    name TEXT,
                    "row" INTEGER DEFAULT 0,
                    "column" INTEGER,
                    FOREIGN KEY("column") REFERENCES cols(id) ON DELETE CASCADE
                );
            """;

            jdbcTemplate.execute(createColsSql);
            jdbcTemplate.execute(createLinksSql);

            // 3. Seed default columns if they don't already exist
            String seedColsSql = """
                INSERT INTO "cols" (id, name) VALUES (1, 'Media')
                ON CONFLICT(id) DO NOTHING;
                INSERT INTO "cols" (id, name) VALUES (2, 'Services')
                ON CONFLICT(id) DO NOTHING;
                INSERT INTO "cols" (id, name) VALUES (3, 'Links')
                ON CONFLICT(id) DO NOTHING;
                INSERT INTO "cols" (id, name) VALUES (4, 'Admin')
                ON CONFLICT(id) DO NOTHING;
            """;

            jdbcTemplate.execute(seedColsSql);

            System.out.println("Database schema, foreign keys, and default columns initialized successfully!");
        };
    }
}