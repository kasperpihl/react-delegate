# react-delegate

Fixing the relationship between parent and child in react to avoid callback hells and over-parenting. :)

# Basic idea
The delegate turns a TaskList component like this:
```
class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.onTaskComplete = this.onTaskComplete.bind(this);
    this.onTaskDelete = this.onTaskDelete.bind(this);
    this.onTaskSchedule = this.onTaskSchedule.bind(this);
  }
  onTaskComplete() { /* completing stuff */ }
  onTaskDelete() { /* deleting stuff */ }
  onTaskSchedule() { /* scheduling stuff */ }

  render() {
    const { tasks } = this.props;

    return tasks.map(task => (
      <Task
        task={task}
        onTaskComplete={this.onTaskComplete}
        onTaskDelete={this.onTaskDelete}
        onTaskSchedule={this.onTaskSchedule}
      />
    ));
  }
}
```

Into looking like that:
```
class TaskList extends React.Component {
  constructor(props) {
    super(props);
  }
  onTaskComplete() { /* completing stuff */ }
  onTaskDelete() { /* deleting stuff */ }
  onTaskSchedule() { /* scheduling stuff */ }

  render() {
    const { tasks } = this.props;

    return tasks.map(task => (
      <Task
        task={task}
        delegate={this}
      />
    ));
  }
}
```

# Installation
```
npm install --save react-delegate
```


# Simple setup
And it is super easy to set up in the Task component
```

import { setupDelegate } from 'react-delegate';
class Task extends React.Component {
  constructor(props) {
    super(props);
    setupDelegate(this, 'onTaskComplete', 'onTaskDelete', 'onTaskSchedule');
  }

  render() {
    const { task } = this.props;
    return (
      <div onClick={this.onTaskComplete}>
        {task.title}
      </div>
    )
  }
}
```

OBS: if the delegate does not implement a function nothing will happen and we will ignore the call.

# Arguments/Properties to the parent
Sometimes you need to include properties though like the taskId or the task itself. This can be achieved using the built-in caching mechanism:

And it is super easy to set up in the Task component
```
class TaskList extends React.Component {
  ...
  onTaskComplete(taskId, task, e) {
    // here you get the arguments from below
  }
  ...
}

import { setupDelegate } from 'react-delegate';
class Task extends React.Component {
  constructor(props) {
    super(props);
    setupDelegate(this, 'onTaskComplete', 'onTaskDelete', 'onTaskSchedule');
  }

  render() {
    const { task } = this.props;
    // Use a cached version with properties to send back
    return (
      <div onClick={this.onTaskCompleteCached(task.id, task)}>
        {task.title}
      </div>
    )
  }
}
```

As you can see, each method you set up also get a Cached version that can take arguments you want to send to the delegate. These arguments will be added before any standard arguments like the event (e).

OBS: The first argument to the cached methods acts as a key. This is to avoid creating a new function all the time on render. So make sure that if you render a list of tasks etc, to use a unique key as the first argument.
