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
            // 1. Create the 'cols' table
            String createColsSql = """
                CREATE TABLE IF NOT EXISTS "cols" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT
                );
            """;

            // 2. Create the 'links' table with the foreign key reference
            String createLinksSql = """
                CREATE TABLE IF NOT EXISTS "links" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    localurl TEXT,
                    remoteurl TEXT,
                    imgurl TEXT,
                    name TEXT,
                    "row" INTEGER DEFAULT 0,
                    "column" INTEGER,
                    FOREIGN KEY("column") REFERENCES cols(id)
                );
            """;

            jdbcTemplate.execute(createColsSql);
            jdbcTemplate.execute(createLinksSql);

            // 3. Seed default columns if they don't already exist
            // Using explicit IDs to match your expected 1-4 mapping
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

            System.out.println("Database schema and default columns initialized successfully!");
        };
    }

}