export interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

const leader: Employee = {
  uniqueId: 1,
  name: "Mark Zuckerberg",
  subordinates: [],
};

interface IEmployeeOrgApp {
  leader: Employee;
  move(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
}

export class EmployeeOrgApp implements IEmployeeOrgApp {
  private moveActions: {
    employee: Employee;
    oldSupervisor: Employee;
    newSupervisor: Employee;
    subordinates: Employee[];
  }[] = [];
  private undoneActions: {
    employee: Employee;
    oldSupervisor: Employee;
    newSupervisor: Employee;
    subordinates: Employee[];
  }[] = [];

  constructor(public leader: Employee) {}

  private getEmployeeById(id: number, root: Employee): Employee | undefined {
    if (root.uniqueId === id) {
      return root;
    }

    for (const subordinate of root.subordinates) {
      const employee = this.getEmployeeById(id, subordinate);
      if (employee) {
        return employee;
      }
    }
  }

  private getSupervisor(
    employee: Employee,
    root: Employee
  ): Employee | undefined {
    for (const subordinate of root.subordinates) {
      if (subordinate.uniqueId === employee.uniqueId) {
        return root;
      }
      const supervisor = this.getSupervisor(employee, subordinate);
      if (supervisor) {
        return supervisor;
      }
    }
  }

  private updateSupervisor(
    employee: Employee,
    oldSupervisor: Employee,
    newSupervisor: Employee,
    subordinatesOfEmployee: Employee[]
  ): void {
    const subordinateIndex = oldSupervisor.subordinates.indexOf(employee);
    if (subordinateIndex > -1) {
      oldSupervisor.subordinates.splice(subordinateIndex, 1);
      oldSupervisor.subordinates.push(...employee.subordinates);
    }
    employee.subordinates = subordinatesOfEmployee
      ? subordinatesOfEmployee
      : [];
    newSupervisor.subordinates.push(employee);
  }

  move(employeeID: number, supervisorID: number): void {
    const employee = this.getEmployeeById(employeeID, this.leader);

    if (!employee) {
      throw new Error(`Employee with id ${employeeID} not found`);
    }

    const oldSupervisor = this.getSupervisor(employee, this.leader);

    const newSupervisor = this.getEmployeeById(supervisorID, this.leader);
    if (!newSupervisor) {
      throw new Error(`Supervisor with id ${supervisorID} not found`);
    }

    if (
      this.moveActions.length > 0 &&
      this.moveActions[this.moveActions.length - 1].employee === employee &&
      this.moveActions[this.moveActions.length - 1].newSupervisor ===
        newSupervisor
    ) {
      console.log("Move action already exists in moveActions array");
      return;
    }

    const oldSubordinates = employee.subordinates;
    this.updateSupervisor(employee, oldSupervisor, newSupervisor, []);
    this.moveActions.push({
      employee,
      oldSupervisor,
      newSupervisor,
      subordinates: oldSubordinates,
    });
  }

  undo(): void {
    const lastMoveAction = this.moveActions.pop();
    if (!lastMoveAction) {
      throw new Error("No actions to undo");
    }
    const { employee, oldSupervisor, newSupervisor, subordinates } =
      lastMoveAction;
    this.updateSupervisor(employee, newSupervisor, oldSupervisor, subordinates);
    this.undoneActions.push({ ...lastMoveAction, subordinates: [] });
  }

  redo(): void {
    const lastUndoneAction = this.undoneActions.pop();
    if (!lastUndoneAction) {
      throw new Error("No actions to redo");
    }

    const { employee, oldSupervisor, newSupervisor, subordinates } =
      lastUndoneAction;
    const oldSubordinates = employee.subordinates;
    this.updateSupervisor(employee, oldSupervisor, newSupervisor, subordinates);
    this.moveActions.push({
      ...lastUndoneAction,
      subordinates: oldSubordinates,
    });
  }
}
