import { Employee, EmployeeOrgApp } from "../src/pixa";

describe("EmployeeOrgApp", () => {
  let ceo: Employee;
  let app: EmployeeOrgApp;

  beforeEach(() => {
    ceo = {
      uniqueId: 1,
      name: "Mark Zuckerberg",
      subordinates: [
        {
          uniqueId: 11,
          name: "Sarah Donald",
          subordinates: [
            {
              uniqueId: 111,
              name: "Cassandra Reynolds",
              subordinates: [
                {
                  uniqueId: 1111,
                  name: "Mary Blue",
                  subordinates: [],
                },
                {
                  uniqueId: 1112,
                  name: "Bob Saget",
                  subordinates: [
                    {
                      uniqueId: 11121,
                      name: "Tina Teff",
                      subordinates: [
                        {
                          uniqueId: 111211,
                          name: "Will Turner",
                          subordinates: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          uniqueId: 12,
          name: "Tyler Simpson",
          subordinates: [
            {
              uniqueId: 121,
              name: "Harry Tobs",
              subordinates: [
                {
                  uniqueId: 1211,
                  name: "Thomas Brown",
                  subordinates: [],
                },
              ],
            },
            {
              uniqueId: 122,
              name: "George Carrey",
              subordinates: [],
            },
            {
              uniqueId: 123,
              name: "Gary Styles",
              subordinates: [],
            },
          ],
        },
        {
          uniqueId: 13,
          name: "Bruce Willis",
          subordinates: [],
        },
        {
          uniqueId: 14,
          name: "Georgina Flangy",
          subordinates: [
            {
              uniqueId: 141,
              name: "Sophie Turner",
              subordinates: [],
            },
          ],
        },
      ],
    };
    app = new EmployeeOrgApp(ceo);
  });

  describe("move", () => {
    it("moves employee to become subordinate of another employee", () => {
      const bob = ceo.subordinates[0].subordinates[0].subordinates[1];
      const georgina = ceo.subordinates[3]; // Georgina Flangy
      const tina = bob.subordinates[0]; // Tina Teff

      // Move Bob to be subordinate of Georgina
      app.move(bob.uniqueId, georgina.uniqueId);

      // Bod should now be subordinate of Georgina Flangy
      expect(georgina.subordinates).toContain(bob);
      expect(bob.subordinates).toEqual([]);

      // Tina should now be subordinate of Cassandra (Bob's old supervisor)
      const cassandra = ceo.subordinates[0].subordinates[0]; // Cassandra Reynolds
      expect(cassandra.subordinates).toContain(tina);
    });
  });

  describe("undo", () => {
    it("undo the last move action", () => {
      const bob = ceo.subordinates[0].subordinates[0].subordinates[1];
      const georgina = ceo.subordinates[3]; // Georgina Flangy
      const tina = bob.subordinates[0]; // Tina Teff

      // Move Bob to be subordinate of Georgina
      app.move(bob.uniqueId, georgina.uniqueId);

      app.undo();

      /**Bod should now still be subordinate of Cassandra (Bob's old supervisor)
      and goergina's subordinates should not contain Bob */
      const cassandra = ceo.subordinates[0].subordinates[0]; // Cassandra Reynolds
      expect(cassandra.subordinates).toContain(bob);
      expect(bob.subordinates).toContain(tina);
      expect(georgina.subordinates).not.toContain(bob);
    });
  });

  describe("redo", () => {
    it("redo the last move action", () => {
      const bob = ceo.subordinates[0].subordinates[0].subordinates[1];
      const georgina = ceo.subordinates[3]; // Georgina Flangy
      const tina = bob.subordinates[0]; // Tina Teff

      // Move Bob to be subordinate of Georgina
      app.move(bob.uniqueId, georgina.uniqueId);

      app.undo();

      app.redo(); // bod, georgina, tina

      // Bod should now be subordinate of Georgina Flangy
      expect(georgina.subordinates).toContain(bob);
      expect(bob.subordinates).toEqual([]);

      // Tina should now be subordinate of Cassandra (Bob's old supervisor)
      const cassandra = ceo.subordinates[0].subordinates[0]; // Cassandra Reynolds
      expect(cassandra.subordinates).toContain(tina);
    });
  });

  describe("move-undo-redo-undo", () => {
    it("redo the last move action", () => {
      const bob = ceo.subordinates[0].subordinates[0].subordinates[1];
      const georgina = ceo.subordinates[3]; // Georgina Flangy
      const tina = bob.subordinates[0]; // Tina Teff

      // Move Bob to be subordinate of Georgina
      app.move(bob.uniqueId, georgina.uniqueId);
      app.undo();
      app.redo();
      app.undo();

      /**Bod should now still be subordinate of Cassandra (Bob's old supervisor)
      and goergina's subordinates should not contain Bob */
      const cassandra = ceo.subordinates[0].subordinates[0]; // Cassandra Reynolds
      expect(cassandra.subordinates).toContain(bob);
      expect(bob.subordinates).toContain(tina);
      expect(georgina.subordinates).not.toContain(bob);
    });
  });
});
