package com.kiandelamarre.dashboard.service;

import com.kiandelamarre.dashboard.dto.Link;
import com.kiandelamarre.dashboard.dto.LinkStatusResponse;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import static com.kiandelamarre.dashboard.dto.LinkStatusResponse.StatusState.*;

@Service
public class LinkMonitorServiceImpl implements LinkMonitorService {

    LinksService linkService;

    public LinkMonitorServiceImpl(LinksService linkService) {
        this.linkService = linkService;
    }


    @Override
    public Map<Integer, LinkStatusResponse> checkAllStatuses() {
        List<Link> allLinks = linkService.getAllLinks();

        // Map each link to an asynchronous ping task
        List<CompletableFuture<LinkStatusResponse>> futures = allLinks.stream().map(link ->
                CompletableFuture.supplyAsync(() -> {
                    LinkStatusResponse status = new LinkStatusResponse();
                    status.setLinkId(link.getId());

                    String localUrl = link.getLocalUrl();
                    status.setLocalStatus(localUrl == null || localUrl.isBlank() ? UNDEFINED : pingUrl(localUrl));

                    String remoteUrl = link.getRemoteUrl();
                    status.setRemoteStatus(remoteUrl == null || remoteUrl.isBlank() ? UNDEFINED : pingUrl(remoteUrl));

                    return status;
                })
        ).toList();

        // Wait for all async pings to complete, then collect into a map
        return futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toMap(LinkStatusResponse::getLinkId, s -> s));
    }

    private LinkStatusResponse.StatusState pingUrl(String urlString) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(3)) // Don't hang forever if a server is down
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlString))
                    .GET() // Or HEAD if you want to save bandwidth, though some servers block HEAD
                    .build();

            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());

            // Standard convention: 2xx and 3xx mean it's up and reachable
            if (response.statusCode() >= 200 && response.statusCode() < 400) {
                return ONLINE;
            } else {
                return UNREACHABLE;
            }

        } catch (Exception e) {
            // Catches timeouts, unknown hosts, connection refusals, invalid URLs, etc.
            return UNREACHABLE;
        }
    }
}
