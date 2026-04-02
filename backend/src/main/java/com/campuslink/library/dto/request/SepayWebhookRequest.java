package com.campuslink.library.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SepayWebhookRequest {

    private String content;

    @JsonProperty("transferAmount")
    private BigDecimal transferAmount;

    private String id;
    private String bankBrandName;
    private String accountNumber;

    @JsonProperty("transferType")
    private String transferType;

    @JsonProperty("referenceCode")
    private String referenceCode;

    private String description;
    private String transactionDate;
}
