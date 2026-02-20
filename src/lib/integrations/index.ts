// Connectors
export { apolloConnector, ApolloConnector } from './apollo-connector';
export type { ApolloContact, ApolloPerson, ApolloSearchResponse, ApolloEnrichResponse } from './apollo-connector';

export { sendgridConnector, SendGridConnector } from './sendgrid-connector';
export type { SendGridContact, SendGridEmailMessage, SendGridListResponse } from './sendgrid-connector';

export { stripeConnector, StripeConnector } from './stripe-connector';
export type { StripePaymentLink, StripeCustomer, StripePaymentIntent, AssessmentTier } from './stripe-connector';

export { weconnectConnector, WeConnectConnector } from './weconnect-connector';
export type { WeConnectCampaign, WeConnectCampaignStats, WeConnectConnectionRequest } from './weconnect-connector';

export { MakeConnector } from './make-connector';
export type { MakeScenario, MakeWebhook, MakeExecution } from './make-connector';

// Registry
export { connectorRegistry, ConnectorRegistry } from './connector-registry';
export type { ConnectorStatus, RegistryHealthReport, ConnectorMetrics } from './connector-registry';
