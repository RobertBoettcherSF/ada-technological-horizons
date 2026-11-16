with Ada.Command_Line;
with Ada.Text_IO;
with Interfaces;
with Ath_Sixes;

procedure Sixes_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Sixes.Status_Code;

   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Check_Chance
     (Trials, Single, Expected : Long_Float;
      Name : String) is
      Chance : Long_Float;
      Status : Ath_Sixes.Status_Code;
   begin
      Ath_Sixes.At_Least_One (Trials, Single, Chance, Status);
      if Status /= Ath_Sixes.Ok or else abs (Chance - Expected) > 1.0e-12 then
         Fail (Name);
      end if;
   end Check_Chance;
begin
   if abs (Ath_Sixes.Single_Chance - 1.65381716879202e-8) > 1.0e-20 then
      Fail ("p1");
   end if;
   Check_Chance (1.0, Ath_Sixes.Single_Chance, Ath_Sixes.Single_Chance, "one-player");
   Check_Chance (1.0e9, Ath_Sixes.Single_Chance, 0.9999999343003227, "billion");
   Check_Chance (0.0, Ath_Sixes.Single_Chance, 0.0, "zero-players");

   if abs (Ath_Sixes.Egg_Count * Ath_Sixes.Egg_Single - 1.0) > 1.0e-12 then
      Fail ("egg-expected");
   end if;
   Check_Chance
     (Ath_Sixes.Egg_Count, Ath_Sixes.Egg_Single, 0.6321206201418064, "egg-chance");

   declare
      Chance : Long_Float;
      Status : Ath_Sixes.Status_Code;
   begin
      Ath_Sixes.At_Least_One (-1.0, 0.1, Chance, Status);
      if Status /= Ath_Sixes.Negative then
         Fail ("negative");
      end if;
   end;

   Ath_Sixes.Roll (1);
   declare
      First : array (1 .. Ath_Sixes.Die_Count) of Interfaces.Integer_32;
      Sixes : Interfaces.Integer_32;
   begin
      Sixes := Ath_Sixes.Six_Count;
      for Die in 1 .. Ath_Sixes.Die_Count loop
         First (Die) := Ath_Sixes.Face (Die);
         if First (Die) < 1 or else First (Die) > 6 then
            Fail ("face");
         end if;
      end loop;
      Ath_Sixes.Roll (2);
      Ath_Sixes.Roll (1);
      for Die in 1 .. Ath_Sixes.Die_Count loop
         if Ath_Sixes.Face (Die) /= First (Die) then
            Fail ("replay");
         end if;
      end loop;
      if Ath_Sixes.Six_Count /= Sixes then
         Fail ("six-count");
      end if;
   end;

   if abs (Ath_Sixes.Players_Of (0.0) - 1.0) > 1.0e-9
     or else abs (Ath_Sixes.Players_Of (1.0) - 1.0e9) > 1.0
     or else abs (Ath_Sixes.Eggs_Of (Ath_Sixes.Slider_Of_Eggs (3.0e6)) - 3.0e6) > 1.0
   then
      Fail ("slider");
   end if;

   if abs (Ath_Sixes.Expected_Winners (1.0e9) - 1.0e9 * Ath_Sixes.Single_Chance) > 1.0e-6
     or else abs (Ath_Sixes.Expected_Winners (3.33e8) - 5.507211172177626) > 1.0e-6
   then
      Fail ("expected");
   end if;

   declare
      First : constant Long_Float := Ath_Sixes.Throws_Until (1);
      Sum : Long_Float := 0.0;
   begin
      if Ath_Sixes.Throws_Until (1) /= First or else First < 1.0 then
         Fail ("until");
      end if;
      for Draw in 1 .. 12 loop
         Sum := Sum + Ath_Sixes.Throws_Until (Draw);
      end loop;
      if Sum / 12.0 < 1.0e6 or else Sum / 12.0 > 5.0e8 then
         Fail ("until-scale");
      end if;
   end;

   if Ath_Sixes.Word (0.01) /= 0 or else Ath_Sixes.Word (0.63) /= 1
     or else Ath_Sixes.Word (0.9999999343) /= 2
   then
      Fail ("word");
   end if;

   if Ath_Sixes.Caption (1.0e-8) /= Ath_Sixes.Caption_Rare
     or else Ath_Sixes.Caption (0.9999999343) /= Ath_Sixes.Caption_Sure
   then
      Fail ("caption");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("SIXES OK");
   else
      Ada.Text_IO.Put_Line ("SIXES FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Sixes_Tests;
