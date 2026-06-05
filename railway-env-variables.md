# Railway Environment Variables — Set These in Railway Dashboard

Copy these into each service's Variables tab on Railway.
Replace values in <ANGLE_BRACKETS> with your actual Railway-provided values.

---

## identity-service

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
ConnectionStrings__DefaultConnection=<RAILWAY_SQL_SERVER_CONNECTION_STRING>
Jwt__Key=SmartSure_SuperSecret_JWT_Key_2024!@#$%
Jwt__Issuer=SmartSureApp
Jwt__Audience=SmartSureClients
InternalApi__Key=SmartSure_Internal_Key_XYZ_2024
RabbitMQ__Host=<CLOUDAMQP_HOST>
RabbitMQ__Username=<CLOUDAMQP_USERNAME>
RabbitMQ__Password=<CLOUDAMQP_PASSWORD>
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__SenderName=SmartSure Insurance
Email__SenderEmail=<YOUR_GMAIL>
Email__Username=<YOUR_GMAIL>
Email__Password=<YOUR_GMAIL_APP_PASSWORD>
```

---

## policy-service

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
ConnectionStrings__DefaultConnection=<RAILWAY_SQL_SERVER_CONNECTION_STRING>
Jwt__Key=SmartSure_SuperSecret_JWT_Key_2024!@#$%
Jwt__Issuer=SmartSureApp
Jwt__Audience=SmartSureClients
InternalApi__Key=SmartSure_Internal_Key_XYZ_2024
RabbitMQ__Host=<CLOUDAMQP_HOST>
RabbitMQ__Username=<CLOUDAMQP_USERNAME>
RabbitMQ__Password=<CLOUDAMQP_PASSWORD>
InternalServices__IdentityServiceUrl=https://<IDENTITY_SERVICE_RAILWAY_URL>/
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__SenderName=SmartSure Insurance
Email__SenderEmail=<YOUR_GMAIL>
Email__Username=<YOUR_GMAIL>
Email__Password=<YOUR_GMAIL_APP_PASSWORD>
```

---

## claims-service

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
ConnectionStrings__DefaultConnection=<RAILWAY_SQL_SERVER_CONNECTION_STRING>
Jwt__Key=SmartSure_SuperSecret_JWT_Key_2024!@#$%
Jwt__Issuer=SmartSureApp
Jwt__Audience=SmartSureClients
InternalApi__Key=SmartSure_Internal_Key_XYZ_2024
RabbitMQ__Host=<CLOUDAMQP_HOST>
RabbitMQ__Username=<CLOUDAMQP_USERNAME>
RabbitMQ__Password=<CLOUDAMQP_PASSWORD>
```

---

## admin-service

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
ConnectionStrings__DefaultConnection=<RAILWAY_SQL_SERVER_CONNECTION_STRING>
Jwt__Key=SmartSure_SuperSecret_JWT_Key_2024!@#$%
Jwt__Issuer=SmartSureApp
Jwt__Audience=SmartSureClients
InternalApi__Key=SmartSure_Internal_Key_XYZ_2024
RabbitMQ__Host=<CLOUDAMQP_HOST>
RabbitMQ__Username=<CLOUDAMQP_USERNAME>
RabbitMQ__Password=<CLOUDAMQP_PASSWORD>
ServiceUrls__IdentityService=https://<IDENTITY_SERVICE_RAILWAY_URL>
ServiceUrls__PolicyService=https://<POLICY_SERVICE_RAILWAY_URL>
ServiceUrls__ClaimsService=https://<CLAIMS_SERVICE_RAILWAY_URL>
```

---

## api-gateway

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
Jwt__Key=SmartSure_SuperSecret_JWT_Key_2024!@#$%
Jwt__Issuer=SmartSureApp
Jwt__Audience=SmartSureClients
```

Note: You must also update ocelot.json downstream URLs to point to Railway service URLs.
See the ocelot.production.json file included in this deployment.

---

## saga-host

```
ASPNETCORE_ENVIRONMENT=Production
RabbitMQ__Host=<CLOUDAMQP_HOST>
RabbitMQ__Username=<CLOUDAMQP_USERNAME>
RabbitMQ__Password=<CLOUDAMQP_PASSWORD>
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__SenderName=SmartSure Insurance
Email__SenderEmail=<YOUR_GMAIL>
Email__Username=<YOUR_GMAIL>
Email__Password=<YOUR_GMAIL_APP_PASSWORD>
```
