# react-delegate

Fixing the relationship between parent and child in react to avoid callback hells and over-parenting. :)

# Basic idea (Parent)
The delegate turns a TaskList component (parent):
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


# Simple setup (child)
And it is super easy to set up in the Task component (child)
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

# Arguments/Properties back to the parent
Sometimes you need to send properties back to the parent like taskId or the task itself. This can be achieved using the built-in caching mechanism:

Parent - receive the arguments
```
class TaskList extends React.Component {
  ...
  onTaskComplete(taskId, task, e) {
    // here you get the arguments from below
  }
  ...
}
```
Child - super easy to set up
```

import { setupDelegate } from 'react-delegate';
class Task extends React.Component {
  constructor(props) {
    super(props);
    setupDelegate(this, 'onTaskComplete', 'onTaskDelete', 'onTaskSchedule');
    // This sets up a this.onTaskCompleteCached that take arguments.
  }

  render() {
    const { task } = this.props;
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
