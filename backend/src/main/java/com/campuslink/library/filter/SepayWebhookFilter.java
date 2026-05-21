package com.campuslink.library.filter;

import com.campuslink.library.dto.request.SepayWebhookRequest;
import com.campuslink.library.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class SepayWebhookFilter implements Filter {

    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    public SepayWebhookFilter(PaymentService paymentService, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  request  = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String uri    = request.getRequestURI();
        String method = request.getMethod();

        log.info("[SePay Filter] method={} uri='{}'", method, uri);

        boolean isWebhook = "POST".equalsIgnoreCase(method) && uri.endsWith("/webhook/sepay");

        if (isWebhook) {
            log.info("[SePay Webhook] ✅ MATCHED uri='{}'", uri);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            try {
                byte[] body = request.getInputStream().readAllBytes();
                log.info("[SePay Webhook] Raw body: {}", new String(body));

                SepayWebhookRequest webhookRequest = objectMapper.readValue(body, SepayWebhookRequest.class);

                log.info("[SePay Webhook] content='{}', amount={}, transferType={}",
                        webhookRequest.getContent(),
                        webhookRequest.getTransferAmount(),
                        webhookRequest.getTransferType());

                if (!"in".equalsIgnoreCase(webhookRequest.getTransferType())) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write("{\"success\":true}");
                    return;
                }

                paymentService.handleSepayWebhook(webhookRequest);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"success\":true}");
                log.info("[SePay Webhook] Xử lý thành công ✅");

            } catch (Exception e) {
                log.error("[SePay Webhook] Lỗi: {}", e.getMessage(), e);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"success\":false}");
            }
            return;
        }

        chain.doFilter(req, res);
    }

    @Configuration
    static class SepayWebhookFilterConfig {
        @Bean
        public FilterRegistrationBean<SepayWebhookFilter> sepayWebhookFilterRegistration(
                SepayWebhookFilter filter) {
            FilterRegistrationBean<SepayWebhookFilter> bean = new FilterRegistrationBean<>(filter);
            // Phải nhỏ hơn Spring Security's order (-100) để chạy TRƯỚC security
            bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
            bean.addUrlPatterns("/*");
            return bean;
        }
    }
}