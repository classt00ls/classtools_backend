'''
* Name: The name of the aggregate.
* Description: A brief description of the aggregate.
* Context: The context where the aggregate belongs.
* Properties: A list of properties that the aggregate has. Optionally, you can specify the type of each property.
* Enforced Invariants: A list of invariants that the aggregate enforces.
* Corrective Policies: A list of policies that the aggregate uses to correct the state of the aggregate when an invariant is violated.
* Domain Events: A list of events that the aggregate emits.
* Ways to access: A list of ways to access the aggregate.
* Technical Integration Notes: Specific details about how this aggregate integrates with external systems.
* Metadata Best Practices: Guidelines for structuring and using metadata effectively.
* Batch Processing Support: How the aggregate handles batch operations.
'''

# Instructions to transform any Aggregate Design Blueprint to code:

You have to create:
* A module for the aggregate:
    * The module name should be the name of the aggregate in plural.
    * Should be written in $FOLDERS_CASE.
    * Should be inside the `src/contexts/$CONTEXT_NAME` directory.
* Every module contains 3 folders: `domain`, `application`, and `infrastructure`.
* Inside the `domain` folder, you'll have to create:
    * An `$AGGREGATE_NAME.$FILES_FORMAT file that contains the aggregate class:
        * The file name should be the name of the aggregate in PascalCase.
        * The aggregate class should have the properties, invariants, policies, and events that the aggregate has.
        * You should take a look to other aggregates to see the format.
    * A `$DOMAIN_EVENT.$FILES_FORMAT file per every event that the aggregate emits:
        * The file name should be the name of the event in PascalCase.
        * The event should have only the mutated properties.
        * You should take a look to other events to see the format.
    * A `$DOMAIN_ERROR.$FILES_FORMAT file per every invariant that the aggregate enforces:
        * The file name should be the name of the invariant in PascalCase.
        * You should take a look to other errors to see the format.
    * A `$REPOSITORY.$FILES_FORMAT file that contains the repository interface:
        * The file name should be the name of the aggregate in PascalCase with the suffix `Repository`.
        * The repository should have the methods to save and retrieve the aggregate.
        * Include specialized methods based on the repository's nature (e.g., search methods for a search repository).
        * For the Embedding repository, include specialized methods for semantic search.
* Inside the `application` folder, you'll have to create:
    * A folder using $FOLDERS_CASE for every mutation that the aggregate has (inferred by the domain events) and for every query that the aggregate has.
    * Inside every query/mutation folder, you'll have to create an `$USE_CASE.$FILES_FORMAT file that contains the query/mutation use case.
        * The file name should be the name of the query/mutation in PascalCase in a service mode. For example:
            * For a `search` query for an aggregate, the class should be `[Aggregate]Searcher.$FILES_FORMAT.
            * For a `create` mutation for an aggregate, the class should be `[Aggregate]Creator.$FILES_FORMAT.
        * You should take a look to other queries/mutations to see the format.
    * For mutations, create corresponding Command and CommandHandler files following the project's CQRS pattern:
        * For example, for `create` use case, create `Create[Aggregate]Command.ts` and `Create[Aggregate]CommandHandler.ts`
        * The CommandHandler should use the use case service and then persist domain events using `CreateEventCommand`
* Inside the `infrastructure` folder, you'll have to create:
    * A folder structure that follows this standardized organization:
        * `Controllers/` - For HTTP endpoints that expose the functionality
            * `[Aggregate]QueryController.ts` - Controllers for query operations
            * `[Aggregate]CommandController.ts` - Controllers for command operations (if needed)
        * `Persistence/` - For repository implementations, organized by technology
            * `[Technology1]/` - Implementation for specific technology #1
                * `[Technology1][Aggregate]Repository.ts` - Repository implementation using that technology
                * The file name should be the name of the aggregate in PascalCase with the suffix `Repository`.
                * Also, the file should have an implementation prefix. For example, for a `User` aggregate and a Postgres implementation, the file should be `PostgresUserRepository.$FILES_FORMAT.
                * The repository should implement the repository interface from the domain layer.
                * You should take a look to other repositories to see the format and use the most used implementation.
                * Services and other implementation files at the root level of Infrastructure
            * `[Technology2]/` - Implementation for specific technology #2 (if multiple implementations exist)
                * `[Technology2][Aggregate]Repository.ts` - Alternative repository implementation
                * The file name should be the name of the aggregate in PascalCase with the suffix `Repository`.
                * Also, the file should have an implementation prefix. For example, for a `User` aggregate and a Postgres implementation, the file should be `PostgresUserRepository.$FILES_FORMAT.
                * The repository should implement the repository interface from the domain layer.
                * You should take a look to other repositories to see the format and use the most used implementation.
                * Services and other implementation files at the root level of Infrastructure
            * `TypeOrm/` - For TypeORM schema definitions (when using TypeORM)
                * `[aggregate].schema.ts` - Schema definition for the entity
                
            * `[ServiceName]Service.ts` - Implementation of domain services
            
# Dependency Injection Pattern for Interfaces:

When working with interfaces in NestJS, follow these guidelines:

1. **Registering the interface implementation** in the module:
   ```typescript
   @Module({
     providers: [
       // Other providers...
       
       // Register an implementation for an interface using string token
       {
         provide: 'YourRepositoryInterface', // Use string token for the interface
         useClass: YourRepositoryImplementation, // Concrete implementation class
       },
       
       // Service that depends on the interface
       YourService,
     ],
   })
   ```

2. **Injecting the interface** in services/controllers:
   ```typescript
   @Injectable()
   export class YourService {
     constructor(
       // Use @Inject decorator with the same string token
       @Inject('YourRepositoryInterface') private readonly repository: YourRepositoryInterface,
       // Other dependencies...
     ) {}
   }
   ```

3. **Why this approach?**: 
   - TypeScript interfaces exist only at compile time, not runtime
   - NestJS needs a runtime identifier (token) to link dependencies
   - String tokens provide this runtime identifier for interfaces

4. **Best practices**:
   - Use consistent naming for tokens (e.g., interface name as string)
   - Consider creating a constants file for token names to avoid typos
   - If you have many modules, create a Provider Factory pattern for complex registrations

Example with constants file:
```typescript
// tokens.ts
export const TOKENS = {
  REPOSITORIES: {
    EMBEDDING_REPOSITORY: 'EmbeddingRepository',
    USER_REPOSITORY: 'UserRepository',
  },
  SERVICES: {
    EMBEDDING_RESPONSE_SERVICE: 'EmbeddingResponseService',
  }
};

// Your module
@Module({
  providers: [
    {
      provide: TOKENS.REPOSITORIES.EMBEDDING_REPOSITORY,
      useClass: PGVectorEmbeddingRepository,
    }
  ]
})

// Your service
@Injectable()
export class SomeService {
  constructor(
    @Inject(TOKENS.REPOSITORIES.EMBEDDING_REPOSITORY) 
    private readonly repository: EmbeddingRepository
  ) {}
}
```

# Event Handling Approach:

In this project, domain events are not published directly via an EventBus. Instead:

1. **Event Storage Pattern**: When aggregate operations emit domain events, these events should be stored using the `CreateEventCommand`:
```typescript
// Example in a CommandHandler
const myAggregate = MyAggregate.create(/* ... */);
await this.repository.save(myAggregate);

// Get domain events from the aggregate
const events = myAggregate.pullDomainEvents();

// Store each event using CreateEventCommand
await Promise.all(
  events.map(async (event) => {
    await this.commandBus.execute(
      new CreateEventCommand(
        event.eventName,
        event.toPrimitives(),
        event.aggregateId
      )
    );
  })
);
```

2. **Event Processing**: Events are later consumed and processed by dedicated handlers registered via `ConsumeEventCommand`

3. **Event Handlers Registration**: Use `EventAutoRegister` mechanism to register event handlers for specific event types

# Implementation Notes for Different Repository Types:

When implementing repositories with specialized technologies (e.g., vector stores, document databases, etc.), consider:

1. **Repository Organization**: 
   - Place technology-specific implementation in `Infrastructure/Persistence/[Technology]/[Technology][Aggregate]Repository.ts`
   - Place schema definitions in `Infrastructure/Persistence/TypeOrm/[aggregate].schema.ts` (for TypeORM)
   - Maintain clear separation between different persistence technologies

2. **Object Translation**: The repository must translate between domain objects and technology-specific structures:
```typescript
// Example translation from domain to technology-specific structure
const specificFormat = {
    id: aggregate.id.value,
    properties: aggregate.toPrimitives(),
    // Other technology-specific transformations
};
```

3. **Specialized Operations**: Implement appropriate patterns for the technology:
   - High-level approach for simple operations
   - Intermediate approach for more control
   - Low-level/manual approach for performance-critical operations

4. **Data Handling**: Properly serialize/deserialize complex data types as needed.

5. **Connection Management**: Handle connection pooling and cleanup appropriately.

# Controller Implementation:

1. **Endpoint Organization**:
   - Create dedicated controllers in `Infrastructure/Controllers/`
   - Implement REST endpoints that follow REST principles
   - Use DTO objects for input validation
   - Leverage Swagger annotations for documentation

2. **Query/Command Patterns**:
   - Implement endpoints that delegate to Command/Query handlers
   - Support filtering, pagination, and customization options
   - Include appropriate error handling

# Service Implementation:

1. **Domain Services**:
   - Implement services at the root level of the Infrastructure folder
   - Integrate with repositories to access domain objects
   - Use appropriate libraries and frameworks as needed
   - Remember to inject interfaces with `@Inject()` as shown in the Dependency Injection Pattern section

# Testing Approach:

Testing strategies should be adjusted based on the aggregate's complexity:

1. **Unit Tests**:
   - Mock external dependencies
   - Focus on testing domain logic: validation, rule enforcement, etc.
   - Test the translation between domain objects and persistence formats
   - Mock CommandBus for event publishing tests

2. **Integration Tests**:
   - Use test databases with appropriate extensions/configuration
   - Test actual storage and retrieval operations
   - Verify event persistence using `CreateEventCommand`

3. **Test Organization**:
   - Group tests by functionality
   - Create specific test suites for complex operations

4. **Testing Principles**:
   - Don't test third-party library internals
   - Focus on your integration with external systems

# User variables:

$FOLDERS_CASE = kebab-case
$FILES_FORMAT = ts

# Example Aggregate Design Blueprint:

This is a sample structure. Replace with your actual aggregate details when implementing.

'''
* Name: YourAggregate
* Description: Brief description of your aggregate.
* Context: YourContext
* Properties:
  - id: string (unique identifier)
  - property1: type1 (description)
  - property2: type2 (description)
  - createdAt: Date
  - updatedAt: Date
* Enforced Invariants:
  - List your invariants here
* Corrective Policies:
  - List your corrective policies here
* Domain Events:
  - YourAggregateCreated: Emitted when created
  - YourAggregateUpdated: Emitted when updated
  - YourAggregateDeleted: Emitted when deleted
* Ways to access:
  - List access patterns here
* Technical Integration Notes:
  - List integration details here
* Other Best Practices:
  - List best practices specific to your aggregate
'''

Important observations for any implementation: 
1. Always use existing folders if they already exist within the context.
2. Align implementation with existing patterns in the codebase.
3. Pay special attention to technology-specific initialization and configuration.
4. Repository implementations should handle the translation between domain objects and technology-specific formats.
5. Follow the project's event pattern by using CreateEventCommand to persist domain events.
6. Strictly adhere to the infrastructure organization pattern:
   - Services at the root level of Infrastructure
   - Controllers in the `Controllers` folder
   - Repository implementations in the `Persistence` folder, separated by technology
7. When working with interfaces, use the string-based token pattern with `@Inject()` as described in the Dependency Injection Pattern section.