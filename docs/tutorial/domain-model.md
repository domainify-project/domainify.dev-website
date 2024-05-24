---
sidebar_position: 2
---

# Domain Model

Article **.** 5/21/2024 **.** [Arash Tafakori](https://github.com/arashtafakori)

## Designing the subdomain

We want to have a Backend service for a task management application. First of all, We try to prepare a model and try to design a model based on DDD (Domain-Driven Design) practice. It does not matter, Whether you have been experienced in DDD or not. It is just enough to look for the tutorial. When you finish the tutorial, regarding the experience you have had in CRUD implementation or other ways, you can implement each kind of model by Domainify, even complicated models. if you are not familiar with DDD, the [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.oreilly.com/library/view/domain-driven-design-tackling/0321125215/) book by Eric Evans is a great resource to learn it.

We design the domain as a strategic design phase. This app includes 3 parts. Project, sprint, and task parts. According to the picture below,there are two bounded contexts and each bounded context includes just one aggregate. The whole of this space is considered as the task management subdomain.

Note that while it is theoretically possible to have more than one aggregate within a bounded context, it's generally recommended to have a single, well-defined aggregate root within a given bounded context. This helps to ensure a clear and straightforward model, making it easier for developers and domain experts to understand and work with the domain.

![](/img/docs/0001-bounded-context.jpg)Figure 0001

## Describing the models

1.  **Project:**
    - **Definition:** In the context of your task management system, a Project is a high-level model. It could be a software development project, a marketing campaign, or any other organized effort.
    - **Aggregate Root:** Project is an entity that is modeled as an aggregate root. It has attributes such as a unique identifier, and a name.
    - **Behavior:** Projects can have behaviors like defining a project, changing the project name, deleting the project, and restoring the project.
2.  **Sprint:**
    - **Definition:** A Sprint is a time-boxed iteration within a Project where a specific set of tasks is planned and completed. It represents a short-term goal within the overall project.
    - **Entity:** Sprint is an entity. It has attributes such as a unique identifier, a name, and start and end date.
    - **Association with Project:** Sprints are typically associated with a specific Project. They can include a set of tasks to be completed during that timespan.
    - **Behavior:** Sprints have behaviors like defining a sprint, changing the sprint name, changing the sprint time span, deleting the sprint, and restoring the sprint.
3.  **Task:**
    - **Definition:** A Task represents a work that needs to be completed within a Project.
    - **Aggregate Root:** Task is an entity that is modeled as an aggregate root. It has attributes such as a unique identifier. It can change over time (e.g., status changes from 'not started' to 'in progress' to 'completed' or 'blocked').
    - **Attributes:** Tasks have attributes such as a description, due date, and status.
    - **Association with Project and Sprint:** Tasks are associated with a specific Project and might be part of a particular Sprint.
    - **Behavior:** Tasks may have behaviors like adding a task,changing the task status, editing the task, deleting the task, restoring the task.

## Implementing the domain components

Open an IDE like VS Code or Visual Studio, It does not matter which IDE is used, in this tutorial we use Visual Studio. we create a black solution with the **todo-example-domainify-sql-efcore**, and next, create a library project with the **Domain** name.

![](/img/docs/0002-solution-explorer.jpg)  
Figure 0002

According to the picture above (Figure 0002), for the domain project library, there is a folder with the **ProjectSetting** name and for that, there are the following folders: **ApplicationRequests**, **DomainRequests**, **Faults**, **ViewModels**, and there are **Checks**, **Commands** and **Queries** folders for the ApplicationRequests and also there are **Invariants** and **Retrievals** folders for the DomainRequests. I will explain these folders' functionality later.

First of all, Let's explain about the project entity, there is Project.cs for this Project entity.

```cs
using Domainify.Domain;
using System.ComponentModel.DataAnnotations;

namespace Domain.ProjectSettingAggregation
{
    public class Project : Entity<Project, string>, IAggregateRoot
    {
        [MinLengthShouldBe(1)]
        [MaxLengthShouldBe(50)]
        [StringLength(50)]
        [Required(AllowEmptyStrings = false)]
        public string Name { get; protected set; } = string.Empty;

        public static Project NewInstance()
        {
            return new Project();
        }

        public Project SetName(string value)
        {
            Name = value;

            return this;
        }
    }
}
```

In the code above, **Project** is inherited in the **Entity** abstract class, `Entity<Project, String>`. Entity abstraction is located in **Domainify.Domain** namespace that belongs to Domainify. Therefore we add the [Domainify](https://www.nuget.org/packages/Domainify/) nuget to the project. The first generic type should be the Project itself and the second generic type is the type of Id that here is String. In addition, it implements the **IAggregateRoot** interface too. In this version, it has no method signature or behavior. but in the next version, it will be able to limit the boundary and provide proxies.

Here, there is just one property for the project entity. It is the Name. it is decorated with four attributes. `[StringLength(50)]` and `[Required(AllowEmptyStrings = false)]` are the built-in ASP.Net Core data annotations, and `[MinLengthShouldBe(1)]` and `[MaxLengthShouldBe(50)]` are the built-in Domainify data annotations. They are set for some targets, It is used for configuring data fields in a database provider and in addition for validating properties value in a request when the properties of a request are bound to the entity properties. We will explain this later.

**MinLengthShouldBe**: is a built-in Domainify FieldValidationAttribute, to set the minimum of a string property of an entity.  
**MaxLengthShouldBe**: is a built-in Domainify FieldValidationAttribute, to set the maximum of a string property of an entity.  
**StringLength**: is a built-in Asp.Net Core ValidationAttribute, to set the length of a string property of an entity.  
**Required**: is a built-in Asp.Net Core ValidationAttribute, to indicate the property is required.

The **NewInstance** method in the Project class is indeed a factory method. It provides a clear and centralized way to create instances of the Project class, encapsulating the instantiation logic and offering potential benefits in terms of maintainability and flexibility.

The project entity needs some behaviors to resolve requests, for example for defining a new project. there is a request as a class with the name 'DefineProject' and with the name property. It is just a POCO class that is known as a data transfer object (DTO), it is usually defined in the Contract layer, but in a domainified project (a project implemented based on the Domainify library), it is known as a command in the ApplicationRequests subsection. It is not just a POCO class as DTO. It includes all DTO properties and resolver. What is a resolver? a resolver is an overridden method for handling validations and invariants and also preparing the result for the request. Next, we will learn how it works.

Let's explain the DefineProject request, there is DefineProject.cs for this request that is implemented in the **ProjectSetting > ApplicationRequests > Commands** path. 

```
using Domainify.Domain;
using MediatR;

namespace Domain.ProjectSettingAggregation
{
    public class DefineProject
        : RequestToCreate<Project, string>
    {
        [BindTo(typeof(Project), nameof(Project.Name))]
        public string Name { get; private set; }

        public DefineProject(string name)
        {
            Name = name.Trim();
            ValidationState.Validate();
        }

        public override async Task<Project> ResolveAndGetEntityAsync(
            IMediator mediator)
        {
            var project = Project.NewInstance()
                .SetName(Name);

            base.Prepare(project);

            InvariantState.AddAnInvariantRequest(new PreventIfTheSameProjectHasAlreadyExisted(name: project.Name));
            await InvariantState.AssestAsync(mediator);

            await base.ResolveAsync(mediator, project);
            return project;
        }
    }
}
```
In the code above, the DefineProject is inherited in the RequestToCreate abstract class, `RequestToCreate<Project, string>`. RequestToCreate abstraction is located in Domainify. Domain namespace that belongs to Domainify. The first generic type should be the Project entity (the entity that the request belongs to) and the second generic type is the type of Id of the entity that it should be returned and that is String here.

There is the Name property, It is the name of a desired project that should be defined. It is marked as private set to enforce encapsulation and is initialized through the constructor. It has been decorated with the BindTo attribute.
To remove repetitive defining annotations for the name property of this command, and the name property of another command like 'ChangeProjectName', we use the BindTo attribute. Because we have defined annotations for the name property for the project entity earlier, the BindTo attribute is efficient for this purpose and we can bind the name property of the 'RequestToCreate' to the name property of the project entity, and the name property of the RequestToCreate inherited all attributes of the name filed of the entity project.

`[BindTo(typeof(Project), nameof(Project.Name))]`: In the first argument, the desired entity is determined and in the second argument, the desired property is determined.

The constructor for the DefineProject class must initialize all required properties. Below is the current implementation which initializes the Name property.