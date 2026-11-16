with Ada.Command_Line;
with Ada.Text_IO;
with Ath_Colony;
with Ath_Galaxy;

procedure Colony_Tests is
   use type Ath_Colony.Status_Code;

   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   Alive, Distance, Hops, Fill_Years : Long_Float;
   Status : Ath_Colony.Status_Code;
begin
   if Ath_Colony.Billion - Ath_Colony.Short_Lived /= Ath_Colony.Left_After
     or else abs (Ath_Colony.Left_After - 10.0e6) > 0.5
   then
      Fail ("ten-million-left");
   end if;
   if abs (Ath_Colony.Self_Deaths - 643_500_000.0) > 0.5
     or else abs (Ath_Colony.Other_Deaths - 346_500_000.0) > 0.5
   then
      Fail ("sixty-five-thirty-five");
   end if;
   if Ath_Colony.Escapers (1) /= 100_000.0
     or else Ath_Colony.Escapers (2) /= 1_000.0
     or else Ath_Colony.Escapers (3) /= 1.0
   then
      Fail ("escapers");
   end if;

   for Choice in 1 .. 3 loop
      if abs (Ath_Colony.Self_Deaths + Ath_Colony.Other_Deaths
              + Ath_Colony.Faded_Later (Choice) + Ath_Colony.Escapers (Choice)
              - Ath_Colony.Billion) > 0.5
        or else Ath_Colony.Faded_Later (Choice) /= Ath_Colony.Left_After - Ath_Colony.Escapers (Choice)
        or else Ath_Colony.Faded_Later (Choice) <= 0.0
      then
         Fail ("three-steps");
      end if;
   end loop;

   Ath_Colony.Survivors (3, 1.0e8, Alive, Distance, Status);
   if Status /= Ath_Colony.Ok
     or else Ath_Colony.Shows_Count (Alive)
     or else abs (Ath_Colony.One_In (Alive) - 150.0) > 0.5
     or else Ath_Colony.Distance_Fits (Alive, Distance)
   then
      Fail ("chance-one-in");
   end if;

   Ath_Colony.Survivors (1, 1.0e8, Alive, Distance, Status);
   if Status /= Ath_Colony.Ok
     or else abs (Alive - Ath_Galaxy.Coexisting (100_000.0, 1.0e8)) > 1.0e-6
     or else abs (Distance - Ath_Galaxy.Neighbour_Of (Alive)) > 1.0e-6
     or else not Ath_Colony.Shows_Count (Alive)
     or else not Ath_Colony.Distance_Fits (Alive, Distance)
     or else Ath_Colony.One_In (Alive) /= 0.0
   then
      Fail ("alive-now");
   end if;

   Ath_Colony.Fill (1_000.0, 10_000.0, Hops, Fill_Years, Status);
   if Status /= Ath_Colony.Ok or else Hops /= 50.0 or else Fill_Years /= 500_000.0 then
      Fail ("fill");
   end if;
   if abs (Ath_Colony.Times_Over (1.0e8, Fill_Years) - 200.0) > 1.0e-6 then
      Fail ("times-over");
   end if;

   Ath_Colony.Fill (1_000.0, 0.0, Hops, Fill_Years, Status);
   if Status /= Ath_Colony.Not_Positive or else Fill_Years /= 0.0 then
      Fail ("zero-hop-time");
   end if;
   Ath_Colony.Fill (0.0, 10_000.0, Hops, Fill_Years, Status);
   if Status /= Ath_Colony.Not_Positive then
      Fail ("zero-hop-distance");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("COLONY OK");
   else
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Colony_Tests;
