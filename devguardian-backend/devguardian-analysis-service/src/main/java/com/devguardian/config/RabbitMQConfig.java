package com.devguardian.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "devguardian.exchange";

    public static final String ANALYSIS_STARTED_QUEUE = "analysis.started.queue";
    public static final String ANALYSIS_STARTED_ROUTING_KEY = "analysis.started";

    public static final String ISSUE_CREATED_QUEUE = "issue.created.queue";
    public static final String ISSUE_CREATED_ROUTING_KEY = "issue.created";

    @Bean
    public TopicExchange devguardianExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue analysisStartedQueue() {
        return QueueBuilder.durable(ANALYSIS_STARTED_QUEUE).build();
    }

    @Bean
    public Binding analysisStartedBinding(Queue analysisStartedQueue, TopicExchange devguardianExchange) {
        return BindingBuilder.bind(analysisStartedQueue)
                .to(devguardianExchange)
                .with(ANALYSIS_STARTED_ROUTING_KEY);
    }

    @Bean
    public Queue issueCreatedQueue() {
        return QueueBuilder.durable(ISSUE_CREATED_QUEUE).build();
    }

    @Bean
    public Binding issueCreatedBinding(Queue issueCreatedQueue, TopicExchange devguardianExchange) {
        return BindingBuilder.bind(issueCreatedQueue)
                .to(devguardianExchange)
                .with(ISSUE_CREATED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
