package com.kiandelamarre.dashboard.repository;

import com.kiandelamarre.dashboard.dto.Link;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class LinkRepository {

    private final JdbcTemplate jdbcTemplate;

    public LinkRepository(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Link> linkRowMapper = (rs, rowNum) -> {
        Link link = new Link();
        link.setId(rs.getInt("id"));
        link.setName(rs.getString("name"));
        link.setLocalUrl(rs.getString("localUrl")); // match your table columns
        link.setRemoteUrl(rs.getString("remoteUrl"));
        link.setImageUrl(rs.getString("imgurl"));
        link.setColumn(rs.getInt("column"));
        link.setRow(rs.getInt("row"));
        return link;
    };

    public List<Link> findAll(){
        String sql = "SELECT * FROM links ORDER BY column, row";
        return jdbcTemplate.query(sql, linkRowMapper);
    }

    public Link findLink(int id) {
        String sql = "SELECT * FROM links WHERE id = ?";
        // Use query status with rowMapper, and fetch a single result or list
        List<Link> links = jdbcTemplate.query(sql, linkRowMapper, id);
        return links.isEmpty() ? null : links.get(0);
    }

    public Link insert(Link link) {
        final String sql = "INSERT INTO links (name, localip, remoteip, imgurl, column, row) VALUES (?, ?, ?, ?, ?, ?)";

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update((Connection conn) -> {
            PreparedStatement statement = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, link.getName());
            statement.setString(2, link.getLocalUrl());
            statement.setString(3, link.getRemoteUrl());
            statement.setString(4, link.getImageUrl());
            statement.setInt(5, link.getColumn());
            statement.setInt(6, link.getRow());
            return statement;
        }, keyHolder);

        // Set the generated ID back onto the link object before returning
        if (keyHolder.getKey() != null) {
            link.setId(keyHolder.getKey().intValue());
        }

        return link;
    }

    public void delete(int id){
        final String sql = "DELETE FROM links WHERE id = ?";

        jdbcTemplate.update(sql, id);
    }

    public Link update(int id, Link link){
        final String sql = "UPDATE links SET" +
                "name = ?, " +
                "localip = ?, " +
                "remoteip = ?, " +
                "imgurl = ?, " +
                "column = ?, " +
                "row = ? " +
                "WHERE id = ?";

        jdbcTemplate.update(sql,
                link.getName(),
                link.getLocalUrl(),
                link.getRemoteUrl(),
                link.getImageUrl(),
                link.getColumn(),
                link.getRow(),
                id);

        link.setId(id);

        return link;
    }


}
