with Ada.Command_Line;
with Ada.Text_IO;
with Ath_Hear;

procedure Hear_Tests is
   use type Ath_Hear.Status_Code;

   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   One_Way : Long_Float;
   Round_Years : Long_Float;
   Generations : Long_Float;
   Status : Ath_Hear.Status_Code;
begin
   if abs (Ath_Hear.Power_Factor (10.0) - 1.0) > 1.0e-12 then
      Fail ("power-reference");
   end if;
   if abs (Ath_Hear.Power_Factor (Ath_Hear.Far_Distance) - 10_000.0) > 1.0e-6 then
      Fail ("power-hundred-times");
   end if;
   if abs (Ath_Hear.Intensity (20.0) - 0.25) > 1.0e-12 then
      Fail ("intensity-double");
   end if;
   if abs (Ath_Hear.Perceptual_Gain (10.0) - 1.0) > 1.0e-9 then
      Fail ("gain-reference");
   end if;
   if abs (Ath_Hear.Perceptual_Gain (20.0) - 0.5) > 1.0e-9 then
      Fail ("gain-double");
   end if;
   if Ath_Hear.Perceptual_Gain (1_000.0) < 0.01
     or else Ath_Hear.Perceptual_Gain (1_000.0) > 0.2
   then
      Fail ("gain-far-still-audible");
   end if;
   if Ath_Hear.Perceptual_Gain (1_000.0) >= Ath_Hear.Perceptual_Gain (10.0) then
      Fail ("gain-falls");
   end if;

   Ath_Hear.Letter (Ath_Hear.Letter_Ly, One_Way, Round_Years, Generations, Status);
   if Status /= Ath_Hear.Ok
     or else abs (One_Way - 1_000.0) > 1.0e-6
     or else abs (Round_Years - 2_000.0) > 1.0e-6
     or else abs (Generations - 80.0) > 1.0e-6
   then
      Fail ("letter");
   end if;
   Ath_Hear.Letter (165.0, One_Way, Round_Years, Generations, Status);
   if Status /= Ath_Hear.Ok
     or else abs (One_Way - 165.0) > 1.0e-6
     or else abs (Round_Years - 330.0) > 1.0e-6
     or else abs (Generations - 13.2) > 1.0e-6
   then
      Fail ("letter-165");
   end if;
   Ath_Hear.Letter (100.0, One_Way, Round_Years, Generations, Status);
   if Status /= Ath_Hear.Ok
     or else abs (One_Way - 100.0) > 1.0e-6
     or else abs (Generations - 8.0) > 1.0e-6
   then
      Fail ("letter-100");
   end if;
   if abs (Ath_Hear.Ozma_Metres - 25.908) > 1.0e-9 then
      Fail ("ozma");
   end if;
   if Ath_Hear.Dish_Lem_Metres /= 27.0 then
      Fail ("lem-dish");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("HEAR OK");
   else
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Hear_Tests;
