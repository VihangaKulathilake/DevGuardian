package com.devguardian.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "devguardian.exchange";
    public static final String NOTIFICATION_SEND_QUEUE = "notification.send.queue";
    public static final String NOTIFICATION_SEND_ROUTING_KEY = "notification.send";

    @Bean
    public TopicExchange devguardianExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue notificationSendQueue() {
        return QueueBuilder.durable(NOTIFICATION_SEND_QUEUE).build();
    }

    @Bean
    public Binding notificationSendBinding(Queue notificationSendQueue, TopicExchange devguardianExchange) {
        return BindingBuilder.bind(notificationSendQueue)
                .to(devguardianExchange)
                .with(NOTIFICATION_SEND_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
