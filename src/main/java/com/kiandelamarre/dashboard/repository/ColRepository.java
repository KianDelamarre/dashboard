package com.kiandelamarre.dashboard.repository;


import com.kiandelamarre.dashboard.dto.Column;
import com.kiandelamarre.dashboard.dto.Column;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class ColumnRepository {

    private final JdbcTemplate jdbcTemplate;

    public ColumnRepository(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Column> colRowMapper = (rs, rowNum) -> {
        Column col = new Column();
        col.setId(rs.getInt("id"));
        col.setName(rs.getString("name"));

        return col;
    };

    public List<Column> findAll(){
        String sql = "SELECT * FROM cols";
        return jdbcTemplate.query(sql, colRowMapper);
    }

    public Column findById(int id) {
        String sql = "SELECT * FROM columns WHERE id = ?";
        // Use query status with rowMapper, and fetch a single result or list
        List<Column> columns = jdbcTemplate.query(sql, columnRowMapper, id);
        return columns.isEmpty() ? null : columns.get(0);
    }

    public Column insert(Column column) {
        final String sql = "INSERT INTO cols (name) VALUES (?)";

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update((Connection conn) -> {
            PreparedStatement statement = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, column.getName());
            return statement;
        }, keyHolder);

        // Set the generated ID back onto the column object before returning
        if (keyHolder.getKey() != null) {
            column.setId(keyHolder.getKey().intValue());
        }

        return column;
    }

    public void delete(int id){
        final String sql = "DELETE FROM cols WHERE id = ?";

        jdbcTemplate.update(sql, id);
    }

    public Column update(int id, Column column){
        final String sql = "UPDATE cols SET " +
                "name = ? " +
                "WHERE id = ?";

        jdbcTemplate.update(sql,
                column.getName(),
                id);

        column.setId(id);

        return column;
    }


    public void saveAll(List<Column> columns) {
        for(Column column : columns){
            update(column.getId(), column);
        }
    }
}

