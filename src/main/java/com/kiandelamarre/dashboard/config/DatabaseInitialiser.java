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
            // 1. Create the 'cols' table first because 'links' references it
            String createColsSql = """
                CREATE TABLE IF NOT EXISTS "cols" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT
                );
            """;

            // 2. Create the 'links' table with all columns and the foreign key reference
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

            System.out.println("Database schema and tables initialized successfully!");
        };
    }

}